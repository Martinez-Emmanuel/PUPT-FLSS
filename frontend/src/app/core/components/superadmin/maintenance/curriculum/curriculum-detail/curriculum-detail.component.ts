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

   // Declare the selected programs array here
   public selectedPrograms: string[] = [];

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
    // Fetch all programs and populate the dropdown
    // this.fetchAllPrograms();

    // const curriculumYear = this.route.snapshot.paramMap.get('year');
    // if (curriculumYear) {
    //   this.fetchCurriculum(curriculumYear);
    // }

    // // Initialize program dropdown with no options
    // this.updateProgramDropdown([]);

    // //Fetch and store all curricula
    // this.curriculumService.getCurricula().subscribe({
    //     next: (curricula) => {
    //         this.curriculumService.updateCurriculaSubject(curricula);
    //     },
    //     error: (error) => {
    //         console.error('Error fetching all curricula:', error);
    //         this.snackBar.open('Error fetching all curricula. Please try again.', 'Close', {
    //             duration: 3000,
    //         });
    //     },
    // });

     

     const curriculumYear = this.route.snapshot.paramMap.get('year');
     if (curriculumYear) {
       this.fetchCurriculum(curriculumYear);
     }

     // Fetch all programs when the component initializes
     this.fetchAllPrograms();
   }
 

   fetchAllPrograms() {
    this.curriculumService.getAllPrograms().subscribe({
      next: (programs) => {
        // Populate the dropdown with all programs
        this.updateProgramDropdown(programs.map(program => program.program_code));
      },
      error: (error) => {
        console.error('Error fetching programs:', error);
        this.snackBar.open('Error fetching programs. Please try again.', 'Close', {
          duration: 3000,
        });
      }
    });
  }



  

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCurriculum(year: string) {
    this.curriculumService.getCurriculumByYear(year).pipe(takeUntil(this.destroy$)).subscribe({
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
        this.snackBar.open('Error fetching curriculum. Please try again.', 'Close', {
          duration: 3000,
        });
      },
    });
  }


  

  // Commented out until needed
  updateHeaderInputFields() {
    const yearLevelOptions = [1, 2, 3, 4, 5];

    this.headerInputFields = [
      {
        type: 'select',
        label: 'Program',
        key: 'program',
        options: this.selectedPrograms, // Use only the selected programs
        // disabled: this.selectedPrograms.length === 0 // Disable dropdown if no options
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
    if (values['yearLevel'] !== undefined) {
      this.selectedYear = values['yearLevel'];
    }

    if (values['program'] !== undefined) {
      this.selectedProgram = values['program'];
    }

    // Ensure the program selection can be changed multiple times
    if (this.selectedProgram && this.selectedYear) {
      this.fetchCoursesForSelectedProgram(this.selectedProgram);
    }

    this.cdr.markForCheck();
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
                  label: program.program_code,
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
                  // Determine which programs were unchecked
                  const uncheckedPrograms = associatedPrograms.filter(ap => !result[ap.program_code]);
  
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
  
                  // Determine which programs were newly checked
                  const newlyCheckedPrograms = allPrograms.filter(program => 
                    result[program.program_code] && 
                    !associatedPrograms.some(ap => ap.program_id === program.program_id)
                  );
  
                  newlyCheckedPrograms.forEach(program => {
                    this.curriculumService.addProgramToCurriculum(curriculumYear, program.program_id).subscribe({
                      next: () => {
                        this.snackBar.open(`${program.program_code} added to curriculum year ${curriculumYear}`, 'Close', { duration: 3000 });
                      },
                      error: (error) => {
                        console.error('Error adding program:', error);
                        this.snackBar.open('Error adding program. Please try again.', 'Close', { duration: 3000 });
                      },
                    });
                  });
  
                  // Store selected programs and update the UI
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
    this.selectedSemesters = []; // Reset semesters
  
    const program = this.curriculum?.programs.find(p => p.name === selectedProgram);
  
    if (program) {
        // Find the selected year level and its semesters
        const yearLevel = program.year_levels.find(y => y.year === this.selectedYear);
        const allSemesters = [1, 2, 3];
  
        const groupedSemesters: { [key: number]: Semester } = {};
  
        allSemesters.forEach(semNumber => {
            const semester = yearLevel?.semesters.find(sem => sem.semester === semNumber);
            groupedSemesters[semNumber] = semester ? { ...semester } : { semester: semNumber, courses: [] };
            console.log(`Semester ${semNumber} courses:`, groupedSemesters[semNumber].courses);
        });
  
        this.selectedSemesters = Object.values(groupedSemesters);
    } else {
        // If the program isn't part of the curriculum, just show empty tables with headers
        this.selectedSemesters = [1, 2, 3].map(semNumber => ({ semester: semNumber, courses: [] }));
        console.log(`Program ${selectedProgram} is not associated with the curriculum, displaying empty tables.`);
    }

    this.cdr.detectChanges(); // Force update the view
  }

  
  
  
  
  
  
  
  
  
  
  



  
// Update the program dropdown method to accept the list of programs
private updateProgramDropdown(programNames: string[]) {
  this.headerInputFields = this.headerInputFields.map(field => {
    if (field.key === 'program') {
      return {
        ...field,
        options: programNames, // Populate with all fetched programs
        disabled: false // Ensure dropdown is always enabled
      };
    }
    return field;
  });

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