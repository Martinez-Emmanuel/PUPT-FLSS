import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent } from '../../../../../../shared/dialog-generic/dialog-generic.component';
import { DialogExportComponent } from '../../../../../../shared/dialog-export/dialog-export.component';
import { LoadingComponent } from '../../../../../../shared/loading/loading.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../../../animations/animations';
import { jsPDF } from 'jspdf'; 
import 'jspdf-autotable'; 

import {
  CurriculumService,
  Curriculum,
  Program,
  YearLevel,
  Semester,
  Course,
} from '../../../../../services/superadmin/curriculum/curriculum.service';

@Component({
  selector: 'app-curriculum-detail',
  imports: [
    CommonModule,
    TableGenericComponent,
    TableHeaderComponent,
    DialogGenericComponent,
    LoadingComponent
  ],
  templateUrl: './curriculum-detail.component.html',
  styleUrls: ['./curriculum-detail.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class CurriculumDetailComponent implements OnInit {
  public curriculum: Curriculum | undefined;
  public selectedProgram: string | number = '';
  public selectedYear: number = 1;
  public selectedSemesters: Semester[] = [];
  public customExportOptions: { all: string; current: string } | null = null;
  private destroy$ = new Subject<void>();
  showPreview: boolean = false;
  public isLoading: boolean = true;

  headerInputFields: InputField[] = [
    {
      type: 'select',
      label: 'Program',
      key: 'program',
      options: [],
    },
    {
      type: 'select',
      label: 'Year Level',
      key: 'yearLevel',
      options: [],
    },
  ];

  columns = [
    { key: 'index', label: '#' },
    { key: 'course_code', label: 'Course Code' },
    { key: 'pre_req', label: 'Pre-req' },
    { key: 'co_req', label: 'Co-req' },
    { key: 'course_title', label: 'Course Title' },
    { key: 'lec_hours', label: 'Lec Hours' },
    { key: 'lab_hours', label: 'Lab Hours' },
    { key: 'units', label: 'Units' },
    { key: 'tuition_hours', label: 'Tuition Hours' },
  ];

  displayedColumns: string[] = [
    'index',
    'course_code',
    'pre_req',
    'co_req',
    'course_title',
    'lec_hours',
    'lab_hours',
    'units',
    'tuition_hours',
    'action',
  ];

  constructor(
    private route: ActivatedRoute,
    private curriculumService: CurriculumService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const curriculumYear = this.route.snapshot.paramMap.get('year');
    if (curriculumYear) {
      this.fetchCurriculum(curriculumYear);
    }

    this.updateCustomExportOptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCurriculum(year: string) {
    this.isLoading = true;
    const previousSelectedProgram = this.selectedProgram;
    const previousSelectedYear = this.selectedYear;
    
    this.curriculumService
      .getCurriculumByYear(year)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curriculum) => {
          console.log('Fetched Curriculum:', curriculum);
          if (curriculum) {
            this.curriculum = curriculum;
  
            if (!this.selectedProgram) {
              this.selectedProgram = 
                curriculum.programs[0]?.curricula_program_id || '';
            }
  
            if (!this.selectedYear) {
              this.selectedYear = 1; 
            }
  
            if (previousSelectedProgram && previousSelectedYear) {
              const program = this.getProgram();
              const yearLevel = this.getYearLevel(program!); 
  
              if (program && yearLevel) {
                this.selectedProgram = previousSelectedProgram;
                this.selectedYear = previousSelectedYear;
              }
            }
  
            this.updateHeaderInputFields();
            this.updateSelectedSemesters();
            this.updateCustomExportOptions();
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          console.error('Error fetching curriculum:', error);
          this.snackBar.open(
            'Error fetching curriculum. Please try again.',
            'Close',
            { duration: 3000 }
          );
        }
      });
    this.isLoading = false;
  }
  
  updateHeaderInputFields() {
    const programOptions = this.curriculum?.programs.map((p) => ({
      key: p.curricula_program_id, 
      label: `${p.name} - ${p.program_title}`, 
    })) || [];
  
    const selectedProgramData = this.curriculum?.programs.find(
      (p) => p.curricula_program_id === Number(this.selectedProgram)

    );

    const yearLevelOptions = selectedProgramData
      ? Array.from(
          { length: selectedProgramData.number_of_years }, 
          (_, i) => ({ key: i + 1, label: `Year ${i + 1}` }) 
        )
      : [];

    this.headerInputFields = [
      {
        type: 'select',
        label: 'Program',
        key: 'program',
        options: programOptions, 
      },
      {
        type: 'select',
        label: 'Year Level',
        key: 'yearLevel',
        options: yearLevelOptions, 
      },
    ];
  }
  
  updateCustomExportOptions() {
    const selectedProgram = this.curriculum?.programs.find(
      program => program.curricula_program_id === this.selectedProgram || 
      program.name === this.selectedProgram
    );
  
    this.customExportOptions = {
      all: 'Export entire curriculum',
      current: `Export ${selectedProgram?.name || 
        this.selectedProgram} program curriculum`,
    };
    this.cdr.detectChanges();
  }

  updateSelectedSemesters() {
    if (this.curriculum) {
      const program = this.getProgram();
      if (program) {
        const yearLevel = this.getYearLevel(program);
        if (yearLevel) {
          this.selectedSemesters = yearLevel.semesters.map((semester) => ({
            ...semester,
            courses: semester.courses.map(course => ({
              ...course,
              pre_req: course.prerequisites?.map(
                p => `${p.course_code} - ${p.course_title}`
              ).join(', ') || 'None',
              co_req: course.corequisites?.map(
                c => `${c.course_code} - ${c.course_title}`
              ).join(', ') || 'None',
            })),
          }));
          this.cdr.detectChanges();
        }
      }
    }
  }
  
  onInputChange(values: { [key: string]: any }) {
    if (values['program'] !== undefined) {
      this.selectedProgram = values['program'];
    }
    if (values['yearLevel'] !== undefined) {
      this.selectedYear = values['yearLevel'];
    }
    
    this.updateHeaderInputFields();
    this.updateSelectedSemesters();
    this.updateCustomExportOptions();
  }
  
  onEditCourse(course: Course, semester: Semester) {
    // Fetch available course titles for the dropdown
    const availableCourseTitles = this.curriculum?.programs
      .flatMap(program => program.year_levels)
      .flatMap(yearLevel => yearLevel.semesters)
      .flatMap(sem => sem.courses)
      .map(course => `${course.course_code} - ${course.course_title}`) || [];
  
    const dialogConfig = this.getCourseDialogConfig(course);
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const program = this.getProgram();
  
        if (!program) {
          this.snackBar.open(
            'Error: Selected program not found.', 'Close', 
            { duration: 3000 }
          );
          return;
        }
  
        const preReqIds = Array.isArray(result.pre_req)
          ? result.pre_req
              .filter((title: string) => title && title !== 'None')
              .map((title: string) => {
                const id = this.getCourseIdByTitle(title);
                return id;
              })
              .filter((id: number | undefined) => id !== undefined)
          : [];
  
        const coReqIds = Array.isArray(result.co_req)
          ? result.co_req
              .filter((title: string) => title && title !== 'None')
              .map((title: string) => {
                const id = this.getCourseIdByTitle(title);
                return id;
              })
              .filter((id: number | undefined) => id !== undefined)
          : [];
  
        const updatedCourse = {
          course_code: result.course_code,
          course_title: result.course_title,
          lec_hours: result.lec_hours,
          lab_hours: result.lab_hours,
          units: result.units,
          tuition_hours: result.tuition_hours,
          curriculum_id: this.curriculum?.curriculum_id,
          semester_id: semester.semester_id,
          year_level_id: this.getYearLevel(program)?.year_level_id,
          curricula_program_id: program.curricula_program_id,
          requirements: [
            ...preReqIds.map((id: number) => ({
              requirement_type: 'pre',
              required_course_id: id,
            })),
            ...coReqIds.map((id: number) => ({
              requirement_type: 'co',
              required_course_id: id,
            }))
          ]
        };
  
        // Store the current program and year level before updating
        const previousSelectedProgram = this.selectedProgram;
        const previousSelectedYear = this.selectedYear;
  
        // Call the update service
        this.curriculumService.updateCourse(
          course.course_id, updatedCourse
        ).subscribe({
          next: (response) => {
            this.snackBar.open('Course updated successfully', 'Close', {
              duration: 3000,
            });
  
            this.fetchCurriculum(
              this.curriculum!.curriculum_year,
            );
  
            this.selectedProgram = previousSelectedProgram;
            this.selectedYear = previousSelectedYear;
            
            this.updateHeaderInputFields();
            this.updateSelectedSemesters();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error updating course:', error);
            this.snackBar.open(
              'Error updating course. Please try again.', 'Close', {
              duration: 3000,
            });
          }
        });
      }
    });
  }
  
  onDeleteCourse(course: Course) {
    this.curriculumService.deleteCourse(course.course_id).subscribe({
      next: () => {
        this.snackBar.open(
          'Course deleted successfully', 'Close', { duration: 3000 }
        );

        if (this.curriculum && this.selectedProgram) {
          const program = this.getProgram();
          if (program) {
            const yearLevel = this.getYearLevel(program);
            if (yearLevel) {
              yearLevel.semesters.forEach((semester) => {
                semester.courses = semester.courses.filter(
                  (c) => c.course_code !== course.course_code
                );
              });
            }
          }
        }

        this.fetchCurriculum(this.curriculum!.curriculum_year);
        this.updateHeaderInputFields();
        this.updateSelectedSemesters();
      },
      error: (error) => {
        console.error('Error deleting course:', error);
        this.snackBar.open(
          'Error deleting course. Please try again.', 'Close',
          { duration: 3000 });
      },
    });
  }
  
  onAddCourse(semester: Semester) {
    if (!this.curriculum) {
      this.snackBar.open(
        'Error: No curriculum loaded.', 'Close', { duration: 3000 }
      );
      return;
    }

    const curriculumId = this.curriculum.curriculum_id; 
    const program = this.getProgram();

    if (!program) {
      this.snackBar.open(
        'Error: Selected program not found.', 'Close', { duration: 3000 }
      );
      return;
    }

    const programId = program.curricula_program_id; 
    const yearLevel = this.getYearLevel(program); 

    if (!curriculumId || !programId || !yearLevel) {
      this.snackBar.open(
        'Error: Missing curriculum, program, or year level information.', 
        'Close', { duration: 3000 }
      );
      return;
    }

    const semesterId = semester.semester_id; 
    const dialogConfig = this.getCourseDialogConfig(
      undefined, semester.semester
    );
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const preReqIds = Array.isArray(result.pre_req) 
          ? result.pre_req
            .filter((title: string) => title && title !== 'None')
            .map((title: string) => {
              const id = this.getCourseIdByTitle(title);
              return id;
            })
            .filter((id: number | undefined) => id !== undefined)
          : [];

        const coReqIds = Array.isArray(result.co_req)
          ? result.co_req
            .filter((title: string) => title && title !== 'None')
            .map((title: string) => {
              const id = this.getCourseIdByTitle(title);
              return id;
            })
            .filter((id: number | undefined) => id !== undefined)
          : [];
            
        const newCourse = {
          course_code: result.course_code,
          course_title: result.course_title,
          lec_hours: result.lec_hours,
          lab_hours: result.lab_hours,
          units: result.units,
          tuition_hours: result.tuition_hours,
          curriculum_id: curriculumId, 
          semester_id: semesterId, 
          year_level_id: yearLevel.year_level_id, 
          curricula_program_id: programId, 
          requirements: [
            ...preReqIds.map((id: number) => ({ 
              requirement_type: 'pre', 
              required_course_id: id 
            })),
            ...coReqIds.map((id: number) => ({
              requirement_type: 'co',
              required_course_id: id
            }))
          ]
        };

        this.curriculumService.addCourse(newCourse).subscribe({
          next: (response) => {
            this.snackBar.open('Course added successfully', 'Close', {
              duration: 3000,
            });

            this.fetchCurriculum(this.curriculum!.curriculum_year);

            this.updateHeaderInputFields();
            this.updateSelectedSemesters();
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error adding course:', error);
            this.snackBar.open(
              'Error adding course. Please try again.', 'Close', {
              duration: 3000,
            });
          }
        });
      }
    });
  }

  getCourseIdByTitle(title: string): number | undefined {    
    const course = this.curriculum?.programs
      .flatMap(program => program.year_levels)
      .flatMap(yearLevel => yearLevel.semesters)
      .flatMap(sem => sem.courses)
      .find(
        course => `${course.course_code} - ${course.course_title}` === title
      );
    return course?.course_id;
  }

  onManagePrograms() {
    const curriculumYear = this.curriculum?.curriculum_year;
    if (!curriculumYear) return;
  
    // Fetch all available programs
    this.curriculumService.getAllPrograms().subscribe(allPrograms => {
      // Fetch curriculum details to identify associated programs
      this.curriculumService.getCurriculumByYear(
        curriculumYear
      ).subscribe(curriculumDetails => {
      if (!curriculumDetails || !curriculumDetails.programs) return;
  
      // Get list of program codes that are associated with the selected curriculum year
      const associatedPrograms = new Set(
        curriculumDetails.programs.map(program => program.name)
      );
  
      // marking those already in the curriculum year as checked
      const dialogConfig: DialogConfig = {
        title: 'Manage Programs',
        isEdit: false,
        fields: allPrograms.map(program => ({
          label: `${program.program_code} - ${program.program_title}`,
          formControlName: program.program_code,
          type: 'checkbox' as 'checkbox',
          required: false,
          checked: associatedPrograms.has(program.program_code)
        })),
        initialValue: allPrograms.reduce((acc, program) => {
          acc[program.program_code] = associatedPrograms.has(
            program.program_code
          );
          return acc;
        }, {} as { [key: string]: boolean }),
      };
  
      const dialogRef = this.dialog.open(TableDialogComponent, {
        data: dialogConfig,
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Loop through each program in the list of all programs
          allPrograms.forEach(program => {  
            const isSelected = result[program.program_code];
            const isInCurriculum = associatedPrograms.has(program.program_code);
      
            if (isSelected && !isInCurriculum) {
              this.curriculumService.addProgramToCurriculum(
                curriculumYear, program.program_id
              ).subscribe(
                () => this.snackBar.open(
                  `${program.program_title} added to curriculum`, 'Close', 
                  { duration: 3000 }
                )
              );
            } else if (!isSelected && isInCurriculum) {
              this.curriculumService.removeProgramFromCurriculum(
                curriculumYear, program.program_id
              ).subscribe(
                () => this.snackBar.open(
                  `${program.program_title} removed from curriculum`, 
                  'Close', { duration: 3000 }
                )
              );
            }
          });
    
          // Refresh the curriculum data to reflect the updated programs
          this.fetchCurriculum(curriculumYear);
          this.updateHeaderInputFields();  
          this.selectedProgram = 
            curriculumDetails.programs[0]?.curricula_program_id || ''; 
          this.cdr.detectChanges(); 
        }
        });
      });
    });
  }
  
  private getCourseDialogConfig(
    course?: Course, semester?: number
  ): DialogConfig {
    const program = this.getProgram();
    // Fetch available course titles for the dropdown
    const availableCourseTitles = program?.year_levels
      .flatMap(yearLevel => yearLevel.semesters)
      .flatMap(sem => sem.courses)
      .map(course => `${course.course_code} - ${course.course_title}`) || [];

    let existingPreReqs: string[] = [];
      if (course?.prerequisites) {
        existingPreReqs = course.prerequisites.map(
          p => `${p.course_code} - ${p.course_title}`
        );
      }
    let existingCoReqs: string[] = [];
      if (course?.corequisites) {
        existingCoReqs = course.corequisites.map(
          c => `${c.course_code} - ${c.course_title}`
        );
      }

    return {
      title: course ? 'Edit Course' : 'Add Course',
      isEdit: !!course,
      fields: [
        {
          label: 'Course Code',
          formControlName: 'course_code',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'Pre-requisite',
          formControlName: 'pre_req',
          type: 'multiselect',
          options: availableCourseTitles,
          required: false,
          initialSelection: existingPreReqs,
        },
        {
          label: 'Co-requisite',
          formControlName: 'co_req',
          type: 'multiselect', 
          options: availableCourseTitles, 
          required: false,
          initialSelection: existingCoReqs,
        },
        {
          label: 'Course Title',
          formControlName: 'course_title',
          type: 'text',
          maxLength: 100,
          required: true,
        },
        {
          label: 'Lecture Hours',
          formControlName: 'lec_hours',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
        {
          label: 'Laboratory Hours',
          formControlName: 'lab_hours',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
        {
          label: 'Units',
          formControlName: 'units',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
        {
          label: 'Tuition Hours',
          formControlName: 'tuition_hours',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
        ],
    initialValue: course ? this.populateCourseRequisites(course) : { semester },
    };
  }

  populateCourseRequisites(course: Course): Course {
    const pre_req = course.prerequisites?.length 
      ? course.prerequisites.map(p => `${p.course_code} - ${p.course_title}`)
      : ['None'];
  
    const co_req = course.corequisites?.length 
      ? course.corequisites.map(c => `${c.course_code} - ${c.course_title}`)
      : ['None'];
  
    return {
      ...course,
      pre_req,
      co_req,
    };
  }

  /* Utility Methods for Data Retrieval */
  private getProgram(): Program | undefined {
    return this.curriculum?.programs.find(
      (p) => p.curricula_program_id === Number(this.selectedProgram)

    );
  }

  private getYearLevel(program: Program): YearLevel | undefined {
    return program?.year_levels.find((y) => y.year === this.selectedYear);
  }

  getSemesterDisplay(semester: number): string {
    return this.curriculumService.mapSemesterToEnum(semester);
  }

  //Export Function
  onExport(option: string | undefined): void {
    if (option === 'all') {
      // Export all programs
      this.openPdfPreviewDialog(true); // Export all programs
    } else if (option === 'current') {
      // Export the selected program
      this.openPdfPreviewDialog(false); // Export selected program only
    }
  }

  openPdfPreviewDialog(exportAll: boolean): void {
    const dialogRef = this.dialog.open(DialogExportComponent, {
      data: {
        exportType: exportAll ? 'all' : 'single',
        generatePdfFunction: (
          showPreview: boolean
        ) => this.generatePDF(showPreview, exportAll),
      },
      maxWidth: '70rem',
      width: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  // Generate the PDF based on the selected option (all or single)
  generatePDF(showPreview: boolean = false, exportAll: boolean = false): void {
    const doc = new jsPDF('p', 'mm', 'letter') as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;

    if (this.curriculum) {
      if (exportAll) {
        // Loop through each program and specify if it’s the first program
        this.curriculum.programs.forEach((program, index) => {
          const isFirstProgram = index === 0;
          this.addProgramToPDF(doc, program, isFirstProgram);
        });
      } else {
        const currentProgram = this.getProgram();
        if (currentProgram) {
          // If only exporting the current program, pass true for isFirstProgram
          this.addProgramToPDF(doc, currentProgram, true);
        } else {
          console.error('No current program available for export');
          return;
        }
      }

      const pdfBlob = doc.output('blob');
      if (showPreview) {
        return pdfBlob;
      } else {
        doc.save('curriculum_report.pdf');
      }
    } else {
      console.error('No curriculum data available');
      return;
    }
  }

  // This function adds the program details to the PDF
  private addProgramToPDF(
    doc: any, program: Program, isFirstProgram: boolean): void {
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 10;
    const topMargin = 15;
    const bottomMargin = 15;
    const logoSize = 22;

    if (!isFirstProgram) {
        doc.addPage();
    }
    let currentY = this.drawHeader(
      doc, topMargin,
      pageWidth, margin, 
      logoSize, `Curriculum Year ${this.curriculum?.curriculum_year || ''}`
    );

    if (!program || !program.year_levels || program.year_levels.length === 0) {
      console.warn('No valid program or year levels found');
      return;
    }

    const sortedYearLevels = program.year_levels.sort((a, b) => a.year - b.year);

    for (const yearLevel of sortedYearLevels) {
      const hasCoursesInYear = yearLevel.semesters.some(
        semester => semester.courses && semester.courses.length > 0
      );

      if (!hasCoursesInYear) continue;

      if (currentY + 20 > pageHeight - bottomMargin) {
        doc.addPage();
        currentY = this.drawHeader(
          doc, topMargin, 
          pageWidth, margin, 
          logoSize, 
          `Curriculum Year ${this.curriculum?.curriculum_year || ''}`
        );
      }

      // Print the year level header
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.text(`${program.name} - Year ${yearLevel.year}`, margin, currentY);
      currentY += 10;

      const sortedSemesters = yearLevel.semesters.sort(
        (a, b) => a.semester - b.semester
      );

      for (const semester of sortedSemesters) {
        if (!semester.courses || semester.courses.length === 0) continue;
        if (currentY + 40 > pageHeight - bottomMargin) {
          doc.addPage();
          currentY = this.drawHeader(
            doc, topMargin, 
            pageWidth, margin, 
            logoSize,
            `Curriculum Year ${this.curriculum?.curriculum_year || ''}`
          );
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(15);
          doc.text(
            `${program.name} - Year ${yearLevel.year} (continued)`, 
            margin, currentY
          );
          currentY += 10;
        }

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(13);
        doc.text(`Semester ${semester.semester}`, margin, currentY);
        currentY += 6;

        // Prepare table data for courses in the semester
        const tableData = semester.courses.map((course) => {
          const processedCourse = this.populateCourseRequisites(course);
          return [
            processedCourse.course_code || 'N/A',
            processedCourse.pre_req || 'None',
            processedCourse.co_req || 'None',
            processedCourse.course_title || 'N/A',
            processedCourse.lec_hours?.toString() || '0',
            processedCourse.lab_hours?.toString() || '0',
            processedCourse.units?.toString() || '0',
            processedCourse.tuition_hours?.toString() || '0',
          ];
        });

        // Render the table for the semester courses
        doc.autoTable({
          startY: currentY,
          head: [[
            'Code', 'Pre-req', 
            'Co-req', 'Title', 
            'Lec', 'Lab', 'Units', 'Tuition']
          ],
          body: tableData,
          theme: 'grid',
          headStyles: {
            fillColor: [128, 0, 0],
            textColor: [255, 255, 255],
            fontSize: 10,
            halign: 'center',
            cellPadding: 1
          },
          bodyStyles: {
            fontSize: 9,
            textColor: [0, 0, 0],
          },
          styles: {
            lineWidth: 0.1,
            overflow: 'linebreak',
            cellPadding: 0.5,
          },
          columnStyles: {
            0: { cellWidth: 'auto' },
            1: { cellWidth: 'auto' },
            2: { cellWidth: 'auto' },
            3: { cellWidth: 'auto' },
            4: { cellWidth: 'auto' },
            5: { cellWidth: 'auto' },
            6: { cellWidth: 'auto' },
            7: { cellWidth: 'auto' },
          },
          margin: { left: 10, right: 10 },
        });

        // Update currentY after the table, adding space below it
        currentY = (doc as any).lastAutoTable.finalY + 8;
      }
      currentY += 5;
    }
  }

  // Draw the header of the PDF
  private drawHeader(
    doc: jsPDF,
    startY: number,
    pageWidth: number,
    margin: number,
    logoSize: number,
    title: string
  ): number {
    doc.setTextColor(0, 0, 0);
    const logoUrl =
      'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';

    // Place the logo at the left margin
    const logoXPosition = margin;
    doc.addImage(logoUrl, 'PNG', logoXPosition, startY - 5, logoSize, logoSize);

    // Calculate the center position of the page
    const centerX = pageWidth / 2;

    let currentY = startY;

    // Set font and styles for the header text
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Center the main header text
    doc.text(
        'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
        centerX,
        currentY,
        { align: 'center' }
    );

    currentY += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // Center the address text
    doc.text(
      'Gen. Santos Ave. Upper Bicutan, Taguig City',
      centerX,
      currentY,
      { align: 'center' }
    );

    currentY += 10;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');

    // Center the title text
    doc.text(title, centerX, currentY, { align: 'center' });
    currentY += 8;

    // Draw a line under the header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 7;

    return currentY;
  }

  cancelPreview(): void {
    this.showPreview = false;
  }
}