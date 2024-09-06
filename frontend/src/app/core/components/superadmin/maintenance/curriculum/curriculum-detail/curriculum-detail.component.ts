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
import { LoadingComponent } from '../../../../../../shared/loading/loading.component';

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
  public loading: boolean = true;

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

     // Fetch all programs when the component initializes
     this.fetchAllPrograms();
  }
 
  fetchAllPrograms() {
    this.loading = true; 
    this.curriculumService.getAllPrograms().subscribe({
      next: (programs) => {
        // Populate the dropdown with all programs
        this.updateProgramDropdown(programs.map(program => program.program_code));
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching programs:', error);
        this.snackBar.open('Error fetching programs. Please try again.', 'Close', {
          duration: 3000,
        });
        this.loading = false;
      }
    });
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCurriculum(year: string, selectedProgram?: string, selectedYear?: number) {
    this.loading = true;
    this.curriculumService.getCurriculumByYear(year).subscribe({
      next: (curriculum) => {
        if (curriculum) {
          console.log('Full Curriculum Object:', curriculum);
          this.curriculum = curriculum;


          // this.selectedProgram = curriculum.programs[0]?.name || ''; 
          // this.selectedYear = 1;

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
            },
            error: (error) => {
              console.error('Error fetching associated programs:', error);
              this.snackBar.open(
                'Error fetching associated programs. Please try again.', 
                'Close', { duration: 3000 });
            }
          });
  
          this.cdr.markForCheck();
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Error fetching curriculum:', error);
        this.snackBar.open(
          'Error fetching curriculum. Please try again.', 
          'Close', { duration: 3000 });
          this.loading = false;
      },
    });
  }
  
  
  updateHeaderInputFields() {
    const yearLevelOptions = [1, 2, 3, 4, 5];
    if (yearLevelOptions.length === 0) {
    console.error('No year level options available.');
  }

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
            courses: semester.courses.map((course) => {
              const pre_req = course.prerequisites?.length 
                ? course.prerequisites.map(p => p.course_title).join(', ') 
                : 'None';
              const co_req = course.corequisites?.length 
                ? course.corequisites.map(c => c.course_title).join(', ') 
                : 'None';
  
              console.log(`Course: ${course.course_code}, Pre-req: ${pre_req}, Co-req: ${co_req}`);
  
              return {
                ...course,
                pre_req: pre_req,
                co_req: co_req,
              };
            }),
          }));
          this.cdr.detectChanges();
        } else {
          console.log('No year level found for year:', this.selectedYear);
          this.selectedSemesters = [];
        }
        this.cdr.detectChanges();
      } else {
        console.log('Program not found:', this.selectedProgram);
      }
    }
  }
  
  onInputChange(values: { [key: string]: any }) {
    console.log('Input Change Detected:', values);

    // Update selected year if a new year level is selected
    if (values['yearLevel'] !== undefined) {
        this.selectedYear = values['yearLevel'];
        console.log('Updated selectedYear:', this.selectedYear);
    }

    // Update selected program if a new program is selected
    if (values['program'] !== undefined) {
        this.selectedProgram = values['program'];
        console.log('Updated selectedProgram:', this.selectedProgram);
    }

    // Proceed only if both selectedProgram and selectedYear are defined
    if (this.selectedProgram && this.selectedYear) {
        // Fetch the relevant program and year level, then update the semesters
        const program = this.getProgram();
        if (program) {
            const yearLevel = this.getYearLevel(program);
            if (yearLevel) {
                console.log('Fetched Year Level ID:', yearLevel.year_level_id);
                this.fetchCoursesForSelectedProgram(this.selectedProgram);
            } else {
                console.log('Year level not found for selected year:', this.selectedYear);
                this.selectedSemesters = []; // Clear semesters if year level is not found
            }
        } else {
            console.log('Program not found for selected program:', this.selectedProgram);
            this.selectedSemesters = []; // Clear semesters if program is not found
        }
    } else {
        console.log('Both selectedProgram and selectedYear are required to update semesters.');
        this.selectedSemesters = []; // Clear semesters if necessary values are missing
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
        .map(course => course.course_title) || [];

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

            // Map course titles to their respective IDs for pre-reqs and co-reqs
            const preReqId = this.getCourseIdByTitle(result.pre_req);
            const coReqId = this.getCourseIdByTitle(result.co_req);

            const updatedCourse = {
                course_code: result.course_code,
                course_title: result.course_title,
                lec_hours: result.lec_hours,
                lab_hours: result.lab_hours,
                units: result.units,
                tuition_hours: result.tuition_hours,
                curriculum_id: this.curriculum?.curriculum_id, // Automatically use the fetched curriculum ID
                semester_id: semester.semester_id, // Automatically use the fetched semester ID
                year_level_id: this.getYearLevel(program)?.year_level_id, // Automatically use the fetched year level ID
                curricula_program_id: program.curricula_program_id, // Automatically use the fetched program ID
                requirements: [
                    { requirement_type: 'pre', required_course_id: preReqId },
                    { requirement_type: 'co', required_course_id: coReqId }
                ].filter(req => req.required_course_id), // Filter out any undefined requirements
            };

            const previousSelectedProgram = this.selectedProgram;
            const previousSelectedYear = this.selectedYear;

            // Proceed with your logic to update the course
            this.curriculumService.updateCourse(course.course_id, updatedCourse).subscribe({
                next: (response) => {
                    this.snackBar.open('Course updated successfully', 'Close', {
                        duration: 3000,
                    });
                     this.fetchCurriculum(this.curriculum!.curriculum_year, previousSelectedProgram, previousSelectedYear);
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
        this.fetchCurriculum(this.curriculum!.curriculum_year, previousSelectedProgram, previousSelectedYear);
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

    const curriculumId = this.curriculum.curriculum_id; // Fetch the curriculum ID
    const program = this.getProgram(); // Fetch the selected program object

    if (!program) {
        this.snackBar.open('Error: Selected program not found.', 'Close', { duration: 3000 });
        return;
    }

    const programId = program.curricula_program_id; // Fetch the program ID from the program object
    const yearLevel = this.getYearLevel(program); // Fetch the selected year level

    if (!curriculumId || !programId || !yearLevel) {
        this.snackBar.open('Error: Missing curriculum, program, or year level information.', 'Close', { duration: 3000 });
        return;
    }

    const semesterId = semester.semester_id; // Fetch the semester ID
    //try
    const previousSelectedProgram = this.selectedProgram; // Store the selected program
    const previousSelectedYear = this.selectedYear; // Save the current selected year level before reloading
    

    console.log('Fetched Curriculum ID:', curriculumId); // Log the fetched curriculum ID
    console.log('Fetched Program ID:', programId); // Log the fetched program ID
    console.log('Fetched Year Level ID:', yearLevel.year_level_id); // Log the fetched year level ID
    console.log('Fetched Semester ID:', semesterId); // Log the fetched semester ID

    const dialogConfig = this.getCourseDialogConfig(undefined, semester.semester);
    const dialogRef = this.dialog.open(TableDialogComponent, {
        data: dialogConfig,
        disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
        if (result) {
            // Map course titles to their respective IDs for pre-reqs and co-reqs
            const preReqId = this.getCourseIdByTitle(result.pre_req);
            const coReqId = this.getCourseIdByTitle(result.co_req);

            const newCourse = {
                course_code: result.course_code,
                course_title: result.course_title,
                lec_hours: result.lec_hours,
                lab_hours: result.lab_hours,
                units: result.units,
                tuition_hours: result.tuition_hours,
                curriculum_id: curriculumId, // Automatically use the fetched curriculum ID
                semester_id: semesterId, // Automatically use the fetched semester ID
                year_level_id: yearLevel.year_level_id, // Automatically use the fetched year level ID
                curricula_program_id: programId, // Automatically use the fetched program ID
                requirements: [
                    { requirement_type: 'pre', required_course_id: preReqId },
                    { requirement_type: 'co', required_course_id: coReqId }
                ].filter(req => req.required_course_id), // Filter out any undefined requirements
            };

            this.curriculumService.addCourse(newCourse).subscribe({
                next: (response) => {
                    this.snackBar.open('Course added successfully', 'Close', {
                        duration: 3000,
                    });

                    this.fetchCurriculum(this.curriculum!.curriculum_year, previousSelectedProgram, previousSelectedYear);
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
  private getCourseIdByTitle(courseTitle: string): number | undefined {
    const course = this.curriculum?.programs
        .flatMap(program => program.year_levels)
        .flatMap(yearLevel => yearLevel.semesters)
        .flatMap(sem => sem.courses)
        .find(course => course.course_title === courseTitle);
    return course?.course_id;
  }

  onExport() {
    alert('Export functionality not implemented yet');
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
    this.selectedSemesters = []; // Reset semesters

    const program = this.curriculum?.programs.find(p => p.name === selectedProgram);

    if (program) {
        // Find the selected year level and its semesters
        const yearLevel = program.year_levels.find(y => y.year === this.selectedYear);
        const allSemesters = [1, 2, 3];

        const groupedSemesters: { [key: number]: Semester } = {};

        allSemesters.forEach(semNumber => {
            const semester = yearLevel?.semesters.find(sem => sem.semester === semNumber);
            groupedSemesters[semNumber] = semester 
                ? { ...semester, courses: semester.courses.map(course => this.populateCourseRequisites(course)) }
                : { semester: semNumber, courses: [], semester_id: 0 }; // Default value for missing semester_id
            console.log(`Semester ${semNumber} courses:`, groupedSemesters[semNumber].courses);
        });

        this.selectedSemesters = Object.values(groupedSemesters);
    } else {
        // If the program isn't part of the curriculum, just show empty tables with headers
        this.selectedSemesters = [1, 2, 3].map(semNumber => ({
            semester_id: 0,  // Set a default semester_id
            semester: semNumber,
            courses: [],
        }));
    }
    this.cdr.detectChanges(); // Force update the view
  }

  // Helper method to populate prerequisites and corequisites
  populateCourseRequisites(course: Course): Course {
    const pre_req = course.prerequisites?.length 
        ? course.prerequisites.map(p => p.course_title).join(', ') 
        : 'None';
    const co_req = course.corequisites?.length 
        ? course.corequisites.map(c => c.course_title).join(', ') 
        : 'None';

    console.log(`Course: ${course.course_code}, Pre-req: ${pre_req}, Co-req: ${co_req}`);

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
        options: programNames, // Populate with programs associated with the curriculum year
      };
    }
    return field;
    });

    this.cdr.markForCheck(); 
  }

  private updateCurriculumPrograms(selectedPrograms: { [key: string]: boolean }) {
    if (!this.curriculum) return;
  
    const selectedProgramNames = Object.keys(selectedPrograms).filter(key => selectedPrograms[key]);
  
    // Update the curriculum's programs based on the selectedProgramNames
    this.curriculum.programs = this.curriculum.programs.filter(program => selectedProgramNames.includes(program.name));
  
    // Update the program dropdown and selected semesters
    this.updateProgramDropdown(selectedProgramNames);
    this.updateSelectedSemesters();
  }

  private getCourseDialogConfig(course?: Course, semester?: number): DialogConfig {
    // Fetch available course titles for the dropdown
    const availableCourseTitles = this.curriculum?.programs
        .flatMap(program => program.year_levels)
        .flatMap(yearLevel => yearLevel.semesters)
        .flatMap(sem => sem.courses)
        .map(course => course.course_title) || [];

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
                type: 'select', // Changed to select
                options: availableCourseTitles, // Use course titles as options
                required: false,
            },
            {
                label: 'Co-requisite',
                formControlName: 'co_req',
                type: 'select', // Changed to select
                options: availableCourseTitles, // Use course titles as options
                required: false,
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
  
  private getProgramId(programName: string): number | undefined {
    const program = this.curriculum?.programs?.find(p => p.name === programName);
    return program?.curricula_program_id;
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
  
}