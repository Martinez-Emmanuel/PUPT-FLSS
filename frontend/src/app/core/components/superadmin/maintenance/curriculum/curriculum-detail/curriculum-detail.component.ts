import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBar } from '@angular/material/progress-bar';

import { TableGenericComponent } from '../../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent } from '../../../../../../shared/dialog-generic/dialog-generic.component';
import { DialogExportComponent } from '../../../../../../shared/dialog-export/dialog-export.component';
import { LoadingComponent } from '../../../../../../shared/loading/loading.component';

import { fadeAnimation, pageFloatUpAnimation } from '../../../../../animations/animations';
import jsPDF from 'jspdf';
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
  standalone: true,
  imports: [
    CommonModule,
    MatProgressBar,
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
  public selectedPrograms: string[] = [];
  public curriculum: Curriculum | undefined;
  public selectedProgram: string = '';
  public selectedYear: number = 1;
  public selectedSemesters: Semester[] = [];
  public customExportOptions: { all: string; current: string } | null = null;
  private destroy$ = new Subject<void>();
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

    this.fetchAllPrograms(); 
  }
 
  fetchAllPrograms() {
    this.isLoading = true;  
    this.curriculumService.getAllPrograms().subscribe({
      next: (programs) => {
        // Populate the dropdown with all programs
        this.updateProgramDropdown(programs.map(program => program.program_code));
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching programs:', error);
        this.snackBar.open('Error fetching programs. Please try again.', 'Close', {
          duration: 3000,
        });
        this.isLoading = false;
      }
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCurriculum(year: string, selectedProgram?: string, selectedYear?: number) {
    this.isLoading = true;
    this.curriculumService.getCurriculumByYear(year).subscribe({
      next: (curriculum) => {
        if (curriculum) {
          console.log('Full Curriculum Object:', curriculum);
          this.curriculum = curriculum;
           // Restore selected program and year, or set defaults
           this.selectedProgram = selectedProgram || curriculum.programs[0]?.name || ''; 
           this.selectedYear = selectedYear || 1; 
  
          // Fetch associated programs and update dropdown
          this.curriculumService.getProgramsByCurriculumYear(year).subscribe({
            next: (programs) => {
              this.selectedPrograms = programs.map(program => program.program_code);
              this.updateHeaderInputFields();
              this.updateProgramDropdown(this.selectedPrograms);
              this.updateSelectedSemesters();
              this.updateCustomExportOptions();
            },
            error: (error) => {
              console.error('Error fetching associated programs:', error);
              this.snackBar.open(
                'Error fetching associated programs. Please try again.', 
                'Close', { duration: 3000 }
              );
            }
          });
          this.cdr.markForCheck();
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching curriculum:', error);
        this.snackBar.open(
          'Error fetching curriculum. Please try again.', 
          'Close', { duration: 3000 });
          this.isLoading = false;
      },
    });
  }

  updateHeaderInputFields() {
    const selectedProgram = this.getProgram();
    const yearLevelOptions = selectedProgram 
      ? Array.from({ length: selectedProgram.number_of_years }, (_, i) => i + 1)
      : [];

  this.headerInputFields = [
    {
      type: 'select',
      label: 'Program',
      key: 'program',
      options: this.selectedPrograms, 
    },
    {
      type: 'select',
      label: 'Year Level',
      key: 'yearLevel',
      options: yearLevelOptions,
      },
    ];
    this.cdr.markForCheck(); 
  }

  updateSelectedSemesters() {
    if (this.curriculum) {
      const program = this.getProgram();
      if (program) {
        const yearLevel = program.year_levels.find(
          (yl) => yl.year === this.selectedYear
        );
  
        if (yearLevel) {
          this.selectedSemesters = yearLevel.semesters.map((semester) => ({
            ...semester,
            courses: semester.courses.map((course) => {
              const pre_req = course.prerequisites?.length 
                ? course.prerequisites.map(p => p.course_title).join(', ') 
                : 'None';
              const co_req = course.corequisites?.length 
                ? course.corequisites.map(c => c.course_title).join(', ') 
                : 'None';  
              return {
                ...course,
                pre_req: pre_req,
                co_req: co_req,
              };
            }),
          }));

          this.cdr.detectChanges();

        } else {
          this.selectedSemesters = [];
        }
        this.cdr.detectChanges();
      } else {
        console.log('Program not found:', this.selectedProgram);
      }
    }
  }
  
  onInputChange(values: { [key: string]: any }) {
      // Update selected program if a new program is selected
    if (values['program'] !== undefined) {
      this.selectedProgram = values['program'];
      this.updateHeaderInputFields();
      this.updateCustomExportOptions();
    }

    if (values['yearLevel'] !== undefined) {
        this.selectedYear = values['yearLevel'];
    }

    if (this.selectedProgram && this.selectedYear) {
        const program = this.getProgram();
        if (program) {
            const yearLevel = this.getYearLevel(program);
            if (yearLevel) {
                this.fetchCoursesForSelectedProgram(this.selectedProgram);
            } else {
              this.selectedSemesters = []; 
            }
        } else {
          this.selectedSemesters = []; 
        }
    } else {
      this.selectedSemesters = [];
    }

    // Ensure that the view is updated
    this.cdr.markForCheck();
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

      // Handle the case where the program is undefined
      if (!program) {
        this.snackBar.open(
          'Error: Selected program not found.', 'Close', 
        { duration: 3000 });
        return;
      }

      // Ensure pre_req is always an array
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
          required_course_id: id
          })),
            ...coReqIds.map((id: number) => ({
            requirement_type: 'co',
            required_course_id: id
          }))
        ]
      };

      const previousSelectedProgram = this.selectedProgram;
      const previousSelectedYear = this.selectedYear;

      this.curriculumService.updateCourse(course.course_id, updatedCourse).subscribe({
        next: (response) => {
          this.snackBar.open('Course updated successfully', 'Close', {
            duration: 3000,
          });
          this.fetchCurriculum(
            this.curriculum!.curriculum_year,
            previousSelectedProgram, 
            previousSelectedYear
          );
          this.cdr.detectChanges(); // Force update the view
        },
        error: (error) => {
          console.error('Error updating course:', error);
          this.snackBar.open('Error updating course. Please try again.', 'Close', {
            duration: 3000,
          });
        }
      });
      }
    });
  }

  onDeleteCourse(course: Course) {
    const previousSelectedProgram = this.selectedProgram;
    const previousSelectedYear = this.selectedYear;

    this.curriculumService.deleteCourse(course.course_id).subscribe({
      next: () => {
        this.snackBar.open('Course deleted successfully', 'Close', {
          duration: 3000,
        });
        this.fetchCurriculum(
          this.curriculum!.curriculum_year, 
          previousSelectedProgram, 
          previousSelectedYear
        );
      },
      error: (error) => {
        console.error('Error deleting course:', error);
        this.snackBar.open('Error deleting course. Please try again.', 'Close', {
          duration: 3000,
        });
      },
    });
  }
  
  onAddCourse(semester: Semester) {
    if (!this.curriculum) {
        this.snackBar.open('Error: No curriculum loaded.', 'Close', { duration: 3000 });
        return;
    }

    const curriculumId = this.curriculum.curriculum_id; 
    const program = this.getProgram();

    if (!program) {
        this.snackBar.open('Error: Selected program not found.', 'Close', { duration: 3000 });
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
    const previousSelectedProgram = this.selectedProgram; 
    const previousSelectedYear = this.selectedYear; 
    
    const dialogConfig = this.getCourseDialogConfig(undefined, semester.semester);
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

        // Process co-requisite IDs
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

            this.fetchCurriculum(
              this.curriculum!.curriculum_year, 
              previousSelectedProgram,
              previousSelectedYear
            );
            this.cdr.detectChanges(); // Force update the view
          },
          error: (error) => {
            console.error('Error adding course:', error);
            this.snackBar.open('Error adding course. Please try again.', 'Close', {
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
      .find(course => `${course.course_code} - ${course.course_title}` === title);
    return course?.course_id;
  }

  onManagePrograms() {
    const curriculumYear = this.curriculum?.curriculum_year;
  
    if (curriculumYear) {
    this.curriculumService.getProgramsByCurriculumYear(curriculumYear).subscribe({
      next: (associatedPrograms) => {
        this.curriculumService.getAllPrograms().subscribe({
          next: (allPrograms) => {
            const dialogConfig: DialogConfig = {
              title: 'Manage Programs',
              isEdit: false,
              fields: allPrograms.map(program => ({
                label: `${program.program_code} - ${program.program_title}`,
                formControlName: program.program_code,
                type: 'checkbox' as 'text' | 'number' | 'select' | 'checkbox',
                required: false,
                checked: associatedPrograms.some(ap => ap.program_id === program.program_id),
              })),
              initialValue: allPrograms.reduce((acc, program) => {
                acc[program.program_code] = associatedPrograms.some(ap => ap.program_id === program.program_id);
                return acc;
              }, {} as { [key: string]: boolean }),
            };

            const dialogRef = this.dialog.open(TableDialogComponent, {
              data: dialogConfig,
            });

            dialogRef.afterClosed().subscribe(result => {
              if (result) {
                const uncheckedPrograms = associatedPrograms.filter(
                  ap => !result[ap.program_code]
                );

                uncheckedPrograms.forEach(program => {
                  this.curriculumService.removeProgramFromCurriculum(curriculumYear, program.program_id).subscribe({
                    next: () => {
                      this.snackBar.open(`${program.program_code} removed from curriculum year ${curriculumYear}`, 'Close', { duration: 3000 });
                    },
                    error: (error) => {
                      console.error('Error removing program:', error);
                      this.snackBar.open('Error removing program. Please try again.', 'Close', { duration: 3000 });
                    },
                  });
                });

                const newlyCheckedPrograms = allPrograms.filter(
                  program => result[program.program_code] && !associatedPrograms.some(ap => ap.program_id === program.program_id)
                );

                newlyCheckedPrograms.forEach(program => {
                  this.curriculumService.addProgramToCurriculum(curriculumYear, program.program_id).subscribe({
                    next: (response) => {
                      if (response && response.data) {
                        const programWithDetails = response.data;
                        const programIndex = this.curriculum?.programs?.findIndex(
                          p => p.program_id === programWithDetails.program_id
                        );

                        if (this.curriculum) {
                          if (programIndex !== undefined && programIndex !== -1) {
                            this.curriculum.programs[programIndex] = programWithDetails;
                          } else {
                            this.curriculum.programs.push(programWithDetails);
                          }

                          this.fetchCurriculum(curriculumYear);
                          this.updateProgramDropdown(this.curriculum.programs.map(p => p.name));
                          this.snackBar.open(`${program.program_code} added to curriculum year ${curriculumYear}`, 'Close', { duration: 3000 });
                          this.cdr.detectChanges();
                        }
                      }
                    },
                    error: (error) => {
                      console.error('Error adding program:', error);
                      this.snackBar.open('Error adding program. Please try again.', 'Close', { duration: 3000 });
                    },
                  });
                });

                this.selectedPrograms = Object.keys(result).filter(key => result[key]);
                this.updateProgramDropdown(this.selectedPrograms);

                if (!this.selectedPrograms.includes(this.selectedProgram)) {
                  this.selectedProgram = '';
                }

                this.selectedSemesters = [];
                this.cdr.detectChanges();
              }
            });
          },
          error: (error) => {
            console.error('Error fetching programs:', error);
            this.snackBar.open('Error fetching programs. Please try again.', 'Close', { duration: 3000 });
          },
        });
      },
      error: (error) => {
        console.error('Error fetching associated programs:', error);
        this.snackBar.open('Error fetching associated programs. Please try again.', 'Close', { duration: 3000 });
      },
    });
  }
  }

  fetchCoursesForSelectedProgram(selectedProgram: string) {
    this.selectedSemesters = []; 

    const program = this.curriculum?.programs.find(p => p.name === selectedProgram);

    if (program) {
        const yearLevel = program.year_levels.find(y => y.year === this.selectedYear);
        const allSemesters = [1, 2, 3];

        const groupedSemesters: { [key: number]: Semester } = {};

        allSemesters.forEach(semNumber => {
          const semester = yearLevel?.semesters.find(sem => sem.semester === semNumber);
          groupedSemesters[semNumber] = semester 
          ? { ...semester, courses: semester.courses.map(
            course => this.populateCourseRequisites(course)
          ) }
          : { semester: semNumber, courses: [], semester_id: 0 }; 
        });
      this.selectedSemesters = Object.values(groupedSemesters);
    } else {
        this.selectedSemesters = [1, 2, 3].map(semNumber => ({
            semester_id: 0, 
            semester: semNumber,
            courses: [],
        }));
    }
    this.cdr.detectChanges(); // Force update the view
  }

  // Helper method to populate prerequisites and corequisites
  populateCourseRequisites(course: Course): Course {
    const pre_req = course.prerequisites?.map(p => 
      `${p.course_code} - ${p.course_title}`
    ) || [];

    const co_req = course.corequisites?.map(c => 
      `${c.course_code} - ${c.course_title}`
  ) || [];
    return {
      ...course,
      pre_req,
      co_req,
    };
  }

  // Update the program dropdown method to accept the list of programs
  private updateProgramDropdown(programNames: string[]) {
    this.headerInputFields = this.headerInputFields.map(field => {
    if (field.key === 'program') {
      return {
        ...field,
        options: programNames, 
      };
    }
    return field;
    });

    this.cdr.markForCheck(); 
  }

  private getCourseDialogConfig(course?: Course, semester?: number): DialogConfig {
    const program = this.getProgram();
    // Fetch available course titles for the dropdown
    const availableCourseTitles = program?.year_levels
      .flatMap(yearLevel => yearLevel.semesters)
      .flatMap(sem => sem.courses)
      .map(course => `${course.course_code} - ${course.course_title}`) || [];

    let existingPreReqs: string[] = [];
      if (course?.prerequisites) {
        existingPreReqs = course.prerequisites.map(p => `${p.course_code} - ${p.course_title}`);
      }
    let existingCoReqs: string[] = [];
      if (course?.corequisites) {
        existingCoReqs = course.corequisites.map(c => `${c.course_code} - ${c.course_title}`);
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
  
  private getProgram(): Program | undefined {
    const normalizedSelectedProgram = this.selectedProgram.trim().toLowerCase();
    const program = this.curriculum?.programs?.find(
      (p) => p.name.trim().toLowerCase() === normalizedSelectedProgram
    );
  
    if (!program) {
      console.error('Program not found:', this.selectedProgram);
    }
  
    return program;
  }

  private getYearLevel(program: Program): YearLevel | undefined {
    return program?.year_levels.find((y) => y.year === this.selectedYear);
  }

  getSemesterDisplay(semester: number): string {
    return this.curriculumService.mapSemesterToEnum(semester);
  }

  trackBySemester(index: number, semester: Semester): number {
    return semester.semester;
  }

  //Export Function
  showPreview: boolean = false;
  updateCustomExportOptions() {
    this.customExportOptions = {
      all: 'Export entire curriculum',
      current: `Export ${this.selectedProgram} program curriculum`
    };
    this.cdr.detectChanges();
  }

  
  onExport(option: string | undefined) : void {
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
        generatePdfFunction: (showPreview: boolean) => this.generatePDF(showPreview, exportAll),
      },
      maxWidth: '70rem',
      width: '100%',
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  generatePDF(showPreview: boolean = false, exportAll: boolean = false): void {
    const doc = new jsPDF('p', 'mm', 'letter') as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const topMargin = 15;
    let currentY = topMargin;

    const leftLogoUrl = 'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';
    doc.addImage(leftLogoUrl, 'PNG', margin, 5, 22, 22);

    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFontSize(8);
    doc.text('Gen. Santos Ave. Upper Bicutan, Taguig City', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    if (this.curriculum) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(17);
      const curriculumText = `${this.curriculum.curriculum_year} Curriculum`;
      doc.text(curriculumText, pageWidth / 2, currentY, { align: 'center' });
      currentY += 7;
    } else {
      console.error('No curriculum data available');
      return;
    }

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 8; 

    if (exportAll) {
        for (const program of this.curriculum.programs || []) {
            this.addProgramToPDF(doc, program, currentY);
            doc.addPage();
            currentY = topMargin;
        }
    } else {
        const currentProgram = this.getProgram();
        if (currentProgram) {
            this.addProgramToPDF(doc, currentProgram, currentY);
        } else {
            console.error('No current program available for export');
            return;
        }
    }

    const pdfBlob = doc.output('blob');
    
    if (showPreview) {
      return pdfBlob;
    } else {
      doc.save('curriclum_report.pdf');
    }
  }

  private addProgramToPDF(doc: any, program: Program, startY: number): void {
    let currentY = startY;
    const pageWidth = doc.internal.pageSize.width; 
    const margin = 10; 
  
    if (!program || !program.year_levels || program.year_levels.length === 0) {
      console.warn('No valid program or year levels found');
      return;
    }
  
    const sortedYearLevels = program.year_levels.sort((a, b) => a.year - b.year);
  
    for (const yearLevel of sortedYearLevels) {
      let yearLevelHasCourses = false;
  
      for (const semester of yearLevel.semesters) {
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
  
        if (tableData.length > 0) {
          yearLevelHasCourses = true;
          break;
        }
      }
  
      if (yearLevelHasCourses) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text(`${program.name} - Year ${yearLevel.year}`, margin, currentY);
        currentY += 7;
  
        const sortedSemesters = yearLevel.semesters.sort((a, b) => a.semester - b.semester);
  
        for (const semester of sortedSemesters) {
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
  
          if (tableData.length > 0) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(13);
            const semesterText = `Semester ${semester.semester}`;
            doc.text(semesterText, margin, currentY);
            currentY += 7;
  
            const availableWidth = pageWidth - 20;
            const columnWidths = [30, 20, 20, 70, 15, 15, 15, 20]; 
  
            doc.autoTable({
              startY: currentY,
              head: [['Code', 'Pre-req', 'Co-req', 'Title', 'Lec', 'Lab', 'Units', 'Tuition']],
              body: tableData,
              theme: 'grid',
              headStyles: {
                fillColor: [128, 0, 0],
                textColor: [255, 255, 255],
                fontSize: 9,
                halign: 'center',
              },
              bodyStyles: {
                fontSize: 10,
                textColor: [0, 0, 0],
              },
              styles: {
                lineWidth: 0.1,
                overflow: 'linebreak',
                cellPadding: 1,
              },
              columnStyles: {
                0: { cellWidth: 20 },
                1: { cellWidth: 40 },
                2: { cellWidth: 20 },
                3: { cellWidth: 50 },
                4: { cellWidth: 15 },
                5: { cellWidth: 15 },
                6: { cellWidth: 15 },
                7: { cellWidth: 20 },
              },
              margin: { left: 10, right: 10 },
            });
  
            currentY = (doc as any).lastAutoTable.finalY + 10;
  
            if (currentY > doc.internal.pageSize.height - 40) {
              doc.addPage();
              currentY = startY;
            }
          }
        }
      }
    }
  }
  
  cancelPreview(): void {
    this.showPreview = false;
  }
}