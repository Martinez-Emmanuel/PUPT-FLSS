import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil, switchMap } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

import {
  SchedulingService, Schedule,
  Program, AcademicYear,
  Semester, YearLevel
} from '../../../services/admin/scheduling/scheduling.service';

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class SchedulingComponent implements OnInit, OnDestroy {
  schedules: Schedule[] = [];
  selectedProgram = '1';
  selectedYear: number = 1; // Maintain as number
  selectedSection = '1';
  selectedCurriculumId: number | null = null;

  activeYear: string = '';
  activeSemester: number = 0; // Initialize as number

  private destroy$ = new Subject<void>();

  headerInputFields: InputField[] = this.initializeHeaderInputFields();
  displayedColumns: string[] = this.initializeDisplayedColumns();

  dayOptions = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  timeOptions: string[] = this.generateTimeOptions();
  professorOptions: string[] = [];
  roomOptions: string[] = [];
  academicYearOptions: AcademicYear[] = [];
  semesterOptions: Semester[] = [];
  programs: Program[] = [];
  programOptions: { 
    display: string, id: number, 
    year_levels: { year_level: number, curriculum_id: number, 
    sections: { section_id: number, section_name: string }[] }[] 
  }[] = [];
  yearLevelOptions: { 
    year_level: number, 
    curriculum_id: number, 
    sections: { section_id: number, section_name: string }[] 
  }[] = [];
  sectionOptions: { section_id: number, section_name: string }[] = [];


  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef 
  ) {}

  ngOnInit() {
    this.loadActiveYearAndSemester();
    this.loadPrograms(() => {
      this.setDefaultSelections();
    });  
  }
  
  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setDefaultSelections(): void {
    if (this.programOptions.length > 0) {
      // Select the first program by default
      const defaultProgram = this.programOptions[0];
      this.selectedProgram = defaultProgram.display;
      this.yearLevelOptions = defaultProgram.year_levels;
  
      // Set the options for year level select dropdown
      this.headerInputFields.find(field => field.key === 'yearLevel')!.options =
        this.yearLevelOptions.map(year => year.year_level); // Keep as number
  
      // Select the first year level by default
      if (this.yearLevelOptions.length > 0) {
        const defaultYearLevel = this.yearLevelOptions[0];
        this.selectedYear = defaultYearLevel.year_level; // Number
        this.selectedCurriculumId = defaultYearLevel.curriculum_id;
        this.sectionOptions = defaultYearLevel.sections;
  
        // Set the sections dropdown options
        this.headerInputFields.find(
          field => field.key === 'section'
        )!.options = this.sectionOptions.map(section => section.section_name);
  
        // Select the first section by default
        if (this.sectionOptions.length > 0) {
          this.selectedSection = this.sectionOptions[0].section_name;
        }
  
        // Trigger input change to fetch the schedules
        this.onInputChange({
          program: this.selectedProgram,
          yearLevel: this.selectedYear, // Number
          section: this.selectedSection,
        });
      }
    }
  }
  


  private loadActiveYearAndSemester() {
    this.schedulingService
      .getActiveYearAndSemester()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ activeYear, activeSemester }) => {
          this.activeYear = activeYear;
          this.activeSemester = activeSemester; 
          console.log('Active Semester Set:', this.activeSemester);
        },
        error: this.handleError('Error fetching active year and semester'),
      });
  }
  
  // Helper function to map the semester number to the corresponding label
  private mapSemesterNumberToLabel(semesterNumber: number): string {
    switch (semesterNumber) {
      case 1:
        return '1st Semester';
      case 2:
        return '2nd Semester';
      case 3:
        return 'Summer Semester';
      default:
        return 'Unknown Semester';
    }
  }

  get activeSemesterLabel(): string {
    return this.mapSemesterNumberToLabel(this.activeSemester);
  }
  

  private loadPrograms(callback?: () => void) {
    this.schedulingService.getActiveYearLevelsCurricula().subscribe((data) => {
      this.programOptions = data.map(program => ({
        display: `${program.program_code} (${program.program_title})`,
        id: program.program_id,
        year_levels: program.year_levels.map((year: YearLevel) => ({
          year_level: year.year_level,
          curriculum_id: year.curriculum_id,
          sections: year.sections 
        }))
      }));
      this.headerInputFields.find(
        field => field.key === 'program'
      )!.options = this.programOptions.map(p => p.display);
  
      // If there's a callback, execute it after programs are loaded
      if (callback) {
        callback();
      }
    }, this.handleError('Error loading programs'));
  }
  
  
  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', {
        duration: 3000,
      });
    };
  }

  private initializeHeaderInputFields(): InputField[] {
    return [
      { type: 'select', label: 'Program', key: 'program', options: [] },
      { type: 'select', label: 'Year Level', key: 'yearLevel', options: [] },
      {
        type: 'select',
        label: 'Section',
        key: 'section',
        options: this.sectionOptions,
      },
    ];
  }

  private initializeDisplayedColumns(): string[] {
    return [
      'index',
      'course_code',
      'course_title',
      'lec_hours',
      'lab_hours',
      'units',
      'tuition_hours',
      'day',
      'time',
      'professor',
      'room',
      'action',
    ];
  }

  private generateTimeOptions(): string[] {
    const options: string[] = [];
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 0) break;
        const time = new Date(2023, 0, 1, hour, minute);
        options.push(
          time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    }
    return options;
  }

  onInputChange(values: { [key: string]: any }) {
    const selectedProgramDisplay = values['program'];
    const selectedYearLevel = values['yearLevel']; // Number
    const selectedSectionDisplay = values['section'];

    // Find the selected program
    const selectedProgram = this.programOptions.find(
      p => p.display === selectedProgramDisplay
    );

    if (selectedProgram) {
      console.log('Selected Program ID:', selectedProgram.id);
      this.yearLevelOptions = selectedProgram.year_levels;

      // Set the options for year level select dropdown
      this.headerInputFields.find(
        field => field.key === 'yearLevel')!.options =
        this.yearLevelOptions.map(
        year => year.year_level // Numbers
      );
    } else {
      console.log('No program found.');
      return; // Exit the function if no program is selected
    }

    // Find the selected year level
    const selectedYearLevelObj = this.yearLevelOptions.find(
      year => year.year_level === selectedYearLevel
    );

    if (selectedYearLevelObj) {
      console.log('Selected Year Level:', selectedYearLevelObj);

      // **Update selectedCurriculumId**
      this.selectedCurriculumId = selectedYearLevelObj.curriculum_id; 

      // Set the sections based on the selected year level
      this.sectionOptions = selectedYearLevelObj.sections;

      this.headerInputFields.find(
        field => field.key === 'section'
      )!.options = this.sectionOptions.map(section => section.section_name);

      console.log('Available Sections for Selected Year Level:', this.sectionOptions);
    } else {
      console.log('No year level found.');
      return;
    }

    const selectedSection = this.sectionOptions.find(
      section => section.section_name === selectedSectionDisplay
    );

    if (selectedSection) {
      console.log('Selected Section ID:', selectedSection.section_id);

      this.fetchCourses(
        selectedProgram.id,
        selectedYearLevel, // Number
        selectedSection.section_id
      );
    } else {
      console.log('No section found.');
    }
  }



  fetchCourses(programId: number, yearLevel: number, sectionId: number) {
    this.schedulingService.getAssignedCoursesByProgramYearAndSection(
      programId, 
      yearLevel, 
      sectionId
    )
      .subscribe(
        (response) => {
          const program = response.programs.find(
            (p: Program) => p.program_id === programId
          );
          console.log('Selected Program:', program);

          if (program) {
            // Reset schedules before pushing new data
            this.schedules = [];

            const selectedYearLevel = program.year_levels.find(
              (yearLevelData: YearLevel) => 
                yearLevelData.year_level === yearLevel && 
                yearLevelData.curriculum_id === this.selectedCurriculumId 
            );

            if (selectedYearLevel) {
              console.log('Selected Year Level:', selectedYearLevel);

              // Iterate through each semester within the selected year level
              selectedYearLevel.semesters.forEach((semester: Semester) => {
                console.log('Semester:', semester);

                // Only consider courses from the active semester
                if (semester.semester === this.activeSemester) {
                  if (semester.courses && semester.courses.length > 0) {
                    // Add courses to the schedules array
                    this.schedules.push(...semester.courses);
                    console.log('Courses added:', semester.courses);
                  } else {
                    console.log('No courses found for this semester');
                  }
                }
              });
            } else {
              console.error(
                'No matching year level found for the selected curriculum'
              );
            }

            // Log final schedules after filtering
            console.log('Final Schedules:', this.schedules);
          } else {
            console.error('No program found');
          }
        },
        (error) => {
          console.error('Error fetching courses', error);
          this.snackBar.open('Failed to fetch courses. Please try again.', 'Close', {
            duration: 3000,
          });
        }
      );
  }
   
  openEditDialog(element: Schedule) {
    const dialogConfig: DialogConfig = {
      title: 'Edit Schedule Details',
      fields: [
        {
          label: 'Day',
          formControlName: 'day',
          type: 'autocomplete',
          options: this.dayOptions,
          required: true,
        },
        {
          label: 'Start Time',
          formControlName: 'startTime',
          type: 'autocomplete',
          options: this.timeOptions,
          required: true,
        },
        {
          label: 'End Time',
          formControlName: 'endTime',
          type: 'autocomplete',
          options: this.timeOptions,
          required: true,
        },
        {
          label: 'Professor',
          formControlName: 'professor',
          type: 'autocomplete',
          options: this.professorOptions,
          required: true,
        },
        {
          label: 'Room',
          formControlName: 'room',
          type: 'autocomplete',
          options: this.roomOptions,
          required: true,
        },
      ],
      isEdit: true,
      initialValue: {
        day: element.day || '',
        startTime: element.time ? element.time.split(' - ')[0] : '',
        endTime: element.time ? element.time.split(' - ')[1] : '',
        professor: element.professor || '',
        room: element.room || '',
      },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
      autoFocus: false,
    });

    dialogRef.componentInstance.startTimeChange.subscribe(
      (startTime: string) => {
      const startIndex = this.timeOptions.indexOf(startTime);
      const validEndTimes = this.timeOptions.slice(startIndex + 1);
      dialogRef.componentInstance.updateEndTimeOptions(validEndTimes);
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedSchedule: Schedule = {
          ...element,
          ...result,
          time: `${result.startTime} - ${result.endTime}`,
        };
        // this.updateSchedule(updatedSchedule);
      }
    });
  }


  openActiveYearSemesterDialog() {
    this.schedulingService.getAcademicYears().subscribe(
      (academicYears: AcademicYear[]) => {
        const academicYearOptions = academicYears.map(
          (year: AcademicYear) => year.academic_year
        );
  
        if (academicYears[0]?.semesters?.length) {
          const semesterOptions = academicYears[0]?.semesters.map(
            (semester: Semester) => semester.semester_number 
          );
  
          const fields = [
            {
              label: 'Academic Year',
              formControlName: 'academicYear',
              type: 'select',
              options: academicYearOptions,
              required: true,
            },
            {
              label: 'Semester',
              formControlName: 'semester',
              type: 'select',
              options: semesterOptions,
              required: true,
            },
          ];
  
          const initialValue = {
            academicYear: this.activeYear || academicYearOptions[0] || '',
            semester: this.activeSemesterLabel || semesterOptions[0] || '',
          };
  
          const dialogRef = this.dialog.open(TableDialogComponent, {
            data: {
              title: 'Set Active Year and Semester',
              fields: fields,
              initialValue: initialValue,
            },
            disableClose: true,
          });
  
          dialogRef.componentInstance.form
            .get('academicYear')
            ?.valueChanges.subscribe((selectedYear: string) => {
              const selectedYearObj = academicYears.find(
                (year) => year.academic_year === selectedYear
              );
              if (selectedYearObj) {
                dialogRef.componentInstance.form.get('semester')?.setValue(null);
                dialogRef.componentInstance.data.fields[1].options =
                  selectedYearObj.semesters.map(
                    (semester: Semester) => semester.semester_number 
                  );
              }
            });
  
          dialogRef.afterClosed().subscribe((result) => {
            if (result) {
              const selectedYearObj = academicYears.find(
                (year) => year.academic_year === result.academicYear
              );
              const selectedSemesterObj = selectedYearObj?.semesters.find(
                (semester) => semester.semester_number === result.semester
              );
  
              if (selectedYearObj && selectedSemesterObj) {
                this.schedulingService
                  .setActiveYearAndSemester(
                    selectedYearObj.academic_year_id,
                    selectedSemesterObj.semester_id 
                  )
                  .pipe(takeUntil(this.destroy$))
                  .subscribe({
                    next: () => {
                      this.activeYear = result.academicYear;
                      this.activeSemester = selectedSemesterObj.semester_id; 
  
                      // **Pass setDefaultSelections as a callback here**
                      this.loadPrograms(() => {
                        this.setDefaultSelections();
                      });
  
                      this.cdr.detectChanges();
  
                      this.snackBar.open(
                        'Active year and semester updated successfully',
                        'Close',
                        {
                          duration: 3000,
                        }
                      );
                      // Removed window.location.reload();
                    },
                    error: this.handleError(
                      'Error setting active year and semester'
                    ),
                  });
              }
            }
          });
        } else {
          console.error(
            'No semesters available for the selected academic year.'
          );
        }
      }
    );
  }
  
}
