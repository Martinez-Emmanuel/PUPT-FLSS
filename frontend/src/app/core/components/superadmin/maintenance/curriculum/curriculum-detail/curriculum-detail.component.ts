import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Commented out until needed
import { TableGenericComponent } from '../../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent } from '../../../../../../shared/dialog-generic/dialog-generic.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../../../animations/animations';

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
    TableGenericComponent, // Commented out for now
    TableHeaderComponent,  // Commented out for now
    DialogGenericComponent,  // Commented out for now
  ],
  templateUrl: './curriculum-detail.component.html',
  styleUrls: ['./curriculum-detail.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation], 
})
export class CurriculumDetailComponent implements OnInit {
  public curriculum: Curriculum | undefined;
  public selectedProgram: string = '';
  public selectedYear: number = 1;
  public selectedSemesters: Semester[] = [];
  public customExportOptions: { all: string; current: string } | null = null;
  private destroy$ = new Subject<void>();

  // Commented out until needed
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

  // Commented out until needed
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

   //Fetch and store all curricula
    this.curriculumService.getCurricula().subscribe({
        next: (curricula) => {
            this.curriculumService.updateCurriculaSubject(curricula);
        },
        error: (error) => {
            console.error('Error fetching all curricula:', error);
            this.snackBar.open('Error fetching all curricula. Please try again.', 'Close', {
                duration: 3000,
            });
        },
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCurriculum(year: string) {
    this.curriculumService
      .getCurriculumByYear(year)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curriculum) => {
          console.log('Retrieved curriculum:', curriculum);
          this.curriculum = curriculum;
          this.selectedProgram = curriculum.programs[0]?.name || ''; 
          this.selectedYear = 1; 
          this.updateHeaderInputFields(); 
          this.updateSelectedSemesters();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error fetching curriculum:', error);
          this.snackBar.open(
            'Error fetching curriculum. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
        },
      });
  }
  
  

  // Commented out until needed
  updateHeaderInputFields() {
    const programOptions = this.curriculum?.programs.map((p) => p.name) || [];
  
    // Assuming you always want to display year levels 1 to 5
    const yearLevelOptions = [1, 2, 3, 4, 5];
  
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
    this.cdr.markForCheck(); // Ensure the view is updated
  }
 

  // Commented out until needed
  // updateCustomExportOptions() {
  //   this.customExportOptions = {
  //     all: 'Export entire curriculum',
  //     current: Export ${this.selectedProgram} curriculum only,
  //   };
  // }

  updateSelectedSemesters() {
    if (this.curriculum) {
      console.log('Updating selected semesters for program:', this.selectedProgram);
      const program = this.getProgram();
      if (program) {
        const yearLevel = program.year_levels.find(
          (yl) => yl.year === this.selectedYear
        );
    
        if (yearLevel) {
          console.log('Year level found:', yearLevel);
          this.selectedSemesters = yearLevel.semesters.map((semester) => ({
            ...semester,
            courses: [...semester.courses],
          }));
        } else {
          console.log('No year level found for year:', this.selectedYear);
          this.selectedSemesters = []; // Clear the semesters if no year level is found
        }
        this.cdr.detectChanges();
      } else {
        console.log('Program not found:', this.selectedProgram);
      }
    }
  }
  

  // Commented out until needed
  onInputChange(values: { [key: string]: any }) {
    console.log('Input Change:', values);
    if (values['program'] !== undefined) {
      this.selectedProgram = values['program'];
      
      // Fetch and display courses for the selected program
      this.fetchCoursesForSelectedProgram(this.selectedProgram);
    }
  
    if (values['yearLevel'] !== undefined) {
      this.selectedYear = values['yearLevel'];
    }
  
    this.updateHeaderInputFields();
    this.cdr.markForCheck(); // Ensure the UI is updated
  }
  
  
  
  

  

  // Commented out until needed
  onEditCourse(course: Course) {
    this.handleCourseDialog(course);
  }

  // Commented out until needed
  onDeleteCourse(course: Course) {
    // this.deleteCourse(course);
  }

  // Commented out until needed
  onAddCourse(semester: number) {
    this.handleCourseDialog(undefined, semester);
  }

  // Commented out until needed
  onExport() {
    alert('Export functionality not implemented yet');
  }

  // Commented out until needed
  onManagePrograms() {
    if (!this.curriculum) return;
  
    this.curriculumService.getAllPrograms().subscribe(programs => {
      const selectedPrograms = this.curriculum!.programs.map(p => p.name);
  
      const dialogConfig: DialogConfig = {
        title: 'Manage Programs',
        isEdit: false,
        fields: programs.map(program => ({
          label: program.program_code,
          formControlName: program.program_code,
          type: 'checkbox' as 'text' | 'number' | 'select' | 'checkbox',
          required: false,
          checked: selectedPrograms.includes(program.program_code),
        })),
        initialValue: programs.reduce((acc, program) => {
          acc[program.name] = selectedPrograms.includes(program.program_code);
          return acc;
        }, {} as { [key: string]: boolean }),
      };
  
      const dialogRef = this.dialog.open(TableDialogComponent, {
        data: dialogConfig,
      });
  
      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          // Collect all selected programs
          const selectedProgramNames = Object.keys(result).filter(key => result[key]);
  
          // Update the dropdown options to show only selected programs
          this.updateProgramDropdown(selectedProgramNames);
  
          // Clear displayed courses until a program is selected from the dropdown
          this.selectedSemesters = [];
          this.cdr.detectChanges(); // Ensure the UI is updated
        }
      });
    });
  }
  
  
  fetchCoursesForSelectedProgram(selectedProgram: string) {
    this.selectedSemesters = []; // Reset semesters
  
    const program = this.curriculum?.programs.find(p => p.name === selectedProgram);
  
    if (program) {
      program.year_levels.forEach(yearLevel => {
        if (yearLevel.year === this.selectedYear) {
          yearLevel.semesters.forEach(semester => {
            this.selectedSemesters.push({
              ...semester,
              courses: [...semester.courses],
            });
          });
        }
      });
    }
  
    this.cdr.detectChanges(); // Force update the view
  }
  
  
  
  
  
  



  
  // New method to update the program dropdown
  private updateProgramDropdown(selectedProgramNames: string[]) {
    // Update the program dropdown with only the selected programs
    this.headerInputFields = this.headerInputFields.map(field => {
      if (field.key === 'program') {
        return {
          ...field,
          options: selectedProgramNames, // Update the options with the selected program names
        };
      }
      return field;
    });
  
    // Set the first selected program as the default
    if (selectedProgramNames.length > 0) {
      this.selectedProgram = selectedProgramNames[0];
    } else {
      this.selectedProgram = '';
    }
  
    this.cdr.markForCheck(); // Ensure that the view is updated
  }
  
  // Commented out until needed
  private updateCurriculumPrograms(selectedPrograms: { [key: string]: boolean }) {
    if (!this.curriculum) return;
  
    const selectedProgramNames = Object.keys(selectedPrograms).filter(key => selectedPrograms[key]);
  
    // Update the curriculum's programs based on the selectedProgramNames
    this.curriculum.programs = this.curriculum.programs.filter(program => selectedProgramNames.includes(program.name));
  
    // Update the program dropdown and selected semesters
    this.updateProgramDropdown(selectedProgramNames);
    this.updateSelectedSemesters();
  
    // Optional: Save the updated curriculum if necessary
    // this.curriculumService.updateCurriculum(this.curriculum).subscribe(
    //   updatedCurriculum => {
    //     this.curriculum = updatedCurriculum;
    //     this.updateHeaderInputFields();
    //     this.updateSelectedSemesters();
    //     this.snackBar.open('Programs updated successfully', 'Close', { duration: 3000 });
    //     this.cdr.detectChanges();
    //   },
    //   error => {
    //     this.snackBar.open('Error updating programs', 'Close', { duration: 3000 });
    //     console.error('Error updating programs:', error);
    //   }
    // );
  }
  

  

  // Commented out until needed
  private getCourseDialogConfig(
    course?: Course,
    semester?: number
  ): DialogConfig {
    return {
      title: course ? 'Edit Course' : 'Add Course',
      isEdit: !!course,
      fields: [
        {
          label: 'Course Code',
          formControlName: 'course_code',
          type: 'text',
          maxLength: 10,
          required: true,
        },
        {
          label: 'Pre-requisite',
          formControlName: 'pre_req',
          type: 'text',
          maxLength: 10,
        },
        {
          label: 'Co-requisite',
          formControlName: 'co_req',
          type: 'text',
          maxLength: 10,
        },
        {
          label: 'Course Title',
          formControlName: 'course_title',
          type: 'text',
          maxLength: 80,
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
      initialValue: course || { semester },
    };
  }

  // Commented out until needed
  private handleCourseDialog(course?: Course, semester?: number): void {
    const dialogConfig = this.getCourseDialogConfig(course, semester);
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });
  }
  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       if (course) {
  //         this.updateCourse(result, course);
  //       } else {
  //         this.addNewCourse(result, semester!);
  //       }
  //     }
  //   });
  // }

  // Commented out until needed
  // private addNewCourse(newCourse: Course, semester: number) {
  //   if (this.curriculum && this.selectedProgram && this.selectedYear) {
  //     const program = this.getProgram();
  //     if (program) {
  //       const yearLevel = this.getYearLevel(program);
  //       if (yearLevel) {
  //         const semesterIndex = yearLevel.semesters.findIndex(
  //           (s) => s.semester === semester
  //         );
  //         if (semesterIndex !== -1) {
  //           yearLevel.semesters[semesterIndex].courses.push(newCourse);
  //           this.saveCurriculumChanges();
  //         }
  //       }
  //     }
  //   }
  // }

  // Commented out until needed
  // private updateCourse(updatedCourse: Course, originalCourse: Course) {
  //   if (this.curriculum && this.selectedProgram && this.selectedYear) {
  //     const program = this.getProgram();
  //     if (program) {
  //       const yearLevel = this.getYearLevel(program);
  //       if (yearLevel) {
  //         const semester = this.getSemester(yearLevel, originalCourse);
  //         if (semester) {
  //           const courseIndex = semester.courses.findIndex(
  //             (c) => c.course_code === originalCourse.course_code
  //           );
  //           if (courseIndex !== -1) {
  //             semester.courses[courseIndex] = updatedCourse;
  //             this.saveCurriculumChanges();
  //           }
  //         }
  //       }
  //     }
  //   }
  // }

  // Commented out until needed
  // private deleteCourse(course: Course) {
  //   if (this.curriculum && this.selectedProgram && this.selectedYear) {
  //     const program = this.getProgram();
  //     if (program) {
  //       const yearLevel = this.getYearLevel(program);
  //       if (yearLevel) {
  //         yearLevel.semesters.forEach((semester) => {
  //           semester.courses = semester.courses.filter(
  //             (c) => c.course_code !== course.course_code
  //           );
  //         });
  //         this.saveCurriculumChanges();
  //       }
  //     }
  //   }
  // }

  // Commented out until needed
  // private saveCurriculumChanges() {
  //   if (this.curriculum) {
  //     this.curriculumService.updateEntireCurriculum(this.curriculum).subscribe(
  //       (updatedCurriculum) => {
  //         this.curriculum = updatedCurriculum;
  //         this.updateSelectedSemesters();
  //         this.snackBar.open('Changes saved successfully', 'Close', {
  //           duration: 3000,
  //         });
  //         this.cdr.detectChanges();
  //       },
  //       (error) => {
  //         this.snackBar.open('Error saving changes', 'Close', {
  //           duration: 3000,
  //         });
  //         console.error('Error saving changes:', error);
  //       }
  //     );
  //   }
  // }

  /* Utility Methods for Data Retrieval */
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

  private getSemester(
    yearLevel: YearLevel,
    course: Course
  ): Semester | undefined {
    return yearLevel?.semesters.find((semester) =>
      semester.courses.some((c) => c.course_code === course.course_code)
    );
  }

  // Commented out until needed
  getSemesterDisplay(semester: number): string {
    return this.curriculumService.mapSemesterToEnum(semester);
  }

  trackBySemester(index: number, semester: Semester): number {
    return semester.semester;
  }
  
}