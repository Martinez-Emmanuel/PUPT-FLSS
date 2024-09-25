import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, tap, map, catchError } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

import { SchedulingService, Schedule, Program, AcademicYear, Semester, YearLevel } from '../../../services/admin/scheduling/scheduling.service';

interface ProgramOption {
  display: string;
  id: number;
  year_levels: YearLevelOption[];
}

interface YearLevelOption {
  year_level: number;
  curriculum_id: number;
  sections: SectionOption[];
}

interface SectionOption {
  section_id: number;
  section_name: string;
}

@Component({
  selector: 'app-scheduling',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class SchedulingComponent implements OnInit, OnDestroy {
  schedules: Schedule[] = [];
  programOptions: ProgramOption[] = [];
  yearLevelOptions: YearLevelOption[] = [];
  sectionOptions: SectionOption[] = [];
  timeOptions: string[] = [];
  professorOptions: string[] = [];
  roomOptions: string[] = [];
  academicYearOptions: AcademicYear[] = [];
  semesterOptions: Semester[] = [];
  programs: Program[] = [];
  dayOptions: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];

  selectedProgram: string = '';
  selectedYear: number = 1;
  selectedSection: string = '';
  selectedCurriculumId: number | null = null;

  activeYear: string = '';
  activeSemester: number = 0;
  startDate: string = '';
  endDate: string = '';

  displayedColumns: string[] = [];
  headerInputFields: InputField[] = [];
  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeHeaderInputFields();
    this.initializeDisplayedColumns();
    this.generateTimeOptions();

    // Load active year/semester and programs in parallel, then set defaults and fetch courses
    forkJoin({
      activeYearSemester: this.loadActiveYearAndSemester(),
      programs: this.loadPrograms(),
    })
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.setDefaultSelections())
      )
      .subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: this.handleError('Error initializing scheduling component'),
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ====================
  // Initialization Methods
  // ====================

  private initializeHeaderInputFields(): void {
    this.headerInputFields = [
      { type: 'select', label: 'Program', key: 'program', options: [] },
      { type: 'select', label: 'Year Level', key: 'yearLevel', options: [] },
      { type: 'select', label: 'Section', key: 'section', options: [] },
    ];
  }

  private initializeDisplayedColumns(): void {
    this.displayedColumns = [
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

  private generateTimeOptions(): void {
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 0) break;
        const time = new Date(2023, 0, 1, hour, minute);
        this.timeOptions.push(
          time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        );
      }
    }
  }

  // ====================
  // Data Loading Methods
  // ====================

  private loadActiveYearAndSemester(): Observable<void> {
    return this.schedulingService.getActiveYearAndSemester().pipe(
      tap(({ activeYear, activeSemester, startDate, endDate }) => {
        this.activeYear = activeYear;
        this.activeSemester = activeSemester;
        this.startDate = startDate;
        this.endDate = endDate;
        console.log('Active Semester Set:', this.activeSemester);
      }),
      map(() => void 0)
    );
  }

  private loadPrograms(): Observable<ProgramOption[]> {
    return this.schedulingService.getActiveYearLevelsCurricula().pipe(
      tap((data) => {
        this.programOptions = data.map((program) => ({
          display: `${program.program_code} - ${program.program_title}`,
          id: program.program_id,
          year_levels: program.year_levels.map((year: YearLevel) => ({
            year_level: year.year_level,
            curriculum_id: year.curriculum_id,
            sections: year.sections,
          })),
        }));
        this.headerInputFields.find(
          (field) => field.key === 'program'
        )!.options = this.programOptions.map((p) => p.display);
      }),
      map(() => this.programOptions),
      catchError((error) => {
        this.handleError('Failed to load programs')(error);
        return of([]);
      })
    );
  }

  // ====================
  // Selection and Data Handling
  // ====================

  private setDefaultSelections(): Observable<void> {
    if (this.programOptions.length > 0) {
      const defaultProgram = this.programOptions[0];
      this.selectedProgram = defaultProgram.display;
      this.yearLevelOptions = defaultProgram.year_levels;

      this.headerInputFields.find((field) => field.key === 'program')!.options =
        this.programOptions.map((p) => p.display);

      this.headerInputFields.find(
        (field) => field.key === 'yearLevel'
      )!.options = this.yearLevelOptions.map((year) => year.year_level);

      if (this.yearLevelOptions.length > 0) {
        const defaultYearLevel = this.yearLevelOptions[0];
        this.selectedYear = defaultYearLevel.year_level;
        this.selectedCurriculumId = defaultYearLevel.curriculum_id;
        this.sectionOptions = defaultYearLevel.sections;

        this.headerInputFields.find(
          (field) => field.key === 'section'
        )!.options = this.sectionOptions.map((section) => section.section_name);

        if (this.sectionOptions.length > 0) {
          this.selectedSection = this.sectionOptions[0].section_name;
        }

        return this.fetchCourses(
          defaultProgram.id,
          this.selectedYear,
          this.sectionOptions[0].section_id
        ).pipe(map(() => void 0));
      }
    }
    return of(void 0);
  }

  onInputChange(values: { [key: string]: any }): void {
    const selectedProgramDisplay = values['program'];
    const selectedYearLevel = values['yearLevel'];
    const selectedSectionDisplay = values['section'];

    const selectedProgram = this.programOptions.find(
      (p) => p.display === selectedProgramDisplay
    );

    if (!selectedProgram) {
      console.log('No program found.');
      return;
    }

    console.log('Selected Program ID:', selectedProgram.id);
    this.yearLevelOptions = selectedProgram.year_levels;

    this.headerInputFields.find((field) => field.key === 'yearLevel')!.options =
      this.yearLevelOptions.map((year) => year.year_level);

    const selectedYearLevelObj = this.yearLevelOptions.find(
      (year) => year.year_level === selectedYearLevel
    );

    if (!selectedYearLevelObj) {
      console.log('No year level found.');
      return;
    }

    console.log('Selected Year Level:', selectedYearLevelObj);
    this.selectedCurriculumId = selectedYearLevelObj.curriculum_id;
    this.sectionOptions = selectedYearLevelObj.sections;

    this.headerInputFields.find((field) => field.key === 'section')!.options =
      this.sectionOptions.map((section) => section.section_name);

    console.log(
      'Available Sections for Selected Year Level:',
      this.sectionOptions
    );

    const selectedSection = this.sectionOptions.find(
      (section) => section.section_name === selectedSectionDisplay
    );

    if (!selectedSection) {
      console.log('No section found.');
      return;
    }

    console.log('Selected Section ID:', selectedSection.section_id);

    this.fetchCourses(
      selectedProgram.id,
      selectedYearLevel,
      selectedSection.section_id
    ).subscribe({
      next: () => {
        // TODO: perform any additional actions after fetching courses
      },
      error: this.handleError('Failed to fetch courses'),
    });
  }

  private fetchCourses(
    programId: number,
    yearLevel: number,
    sectionId: number
  ): Observable<Schedule[]> {
    return this.schedulingService
      .getAssignedCoursesByProgramYearAndSection(
        programId,
        yearLevel,
        sectionId
      )
      .pipe(
        tap((response) => {
          const program = response.programs.find(
            (p: Program) => p.program_id === programId
          );
          console.log('Selected Program:', program);

          if (!program) {
            console.error('No program found');
            return;
          }

          this.schedules = [];

          const selectedYearLevel = program.year_levels.find(
            (yearLevelData: YearLevel) =>
              yearLevelData.year_level === yearLevel &&
              yearLevelData.curriculum_id === this.selectedCurriculumId
          );

          if (!selectedYearLevel) {
            console.error(
              'No matching year level found for the selected curriculum'
            );
            return;
          }

          console.log('Selected Year Level:', selectedYearLevel);

          selectedYearLevel.semesters.forEach((semester: Semester) => {
            console.log('Semester:', semester);

            if (semester.semester === this.activeSemester) {
              if (semester.courses && semester.courses.length > 0) {
                this.schedules.push(...semester.courses);
                console.log('Courses added:', semester.courses);
              } else {
                console.log('No courses found for this semester');
              }
            }
          });

          console.log('Final Schedules:', this.schedules);
        }),
        map(() => this.schedules),
        catchError((error) => {
          this.handleError('Failed to fetch courses')(error);
          return of([]);
        })
      );
  }

  // ====================
  // Dialog Methods
  // ====================

  openEditDialog(element: Schedule): void {
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

    dialogRef.componentInstance.startTimeChange
      .pipe(takeUntil(this.destroy$))
      .subscribe((startTime: string) => {
        const startIndex = this.timeOptions.indexOf(startTime);
        const validEndTimes = this.timeOptions.slice(startIndex + 1);
        dialogRef.componentInstance.updateEndTimeOptions(validEndTimes);
      });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
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

  openActiveYearSemesterDialog(): void {
    this.schedulingService
      .getAcademicYears()
      .pipe(
        takeUntil(this.destroy$),
        tap((academicYears: AcademicYear[]) => {
          if (!academicYears.length) {
            console.error('No academic years available');
            return;
          }

          this.academicYearOptions = academicYears;
          const academicYearOptions = academicYears.map(
            (year: AcademicYear) => year.academic_year
          );

          const semesterOptions =
            academicYears[0]?.semesters?.map(
              (semester: Semester) => semester.semester_number
            ) || [];

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
            {
              label: 'Start Date',
              formControlName: 'startDate',
              type: 'date',
              required: true,
            },
            {
              label: 'End Date',
              formControlName: 'endDate',
              type: 'date',
              required: true,
            },
          ];

          const initialValue = {
            academicYear: this.activeYear || academicYearOptions[0] || '',
            semester: this.activeSemesterLabel || semesterOptions[0] || '',
            startDate: this.startDate || null,
            endDate: this.endDate || null,
          };

          const dialogRef = this.dialog.open(TableDialogComponent, {
            data: {
              title: 'Set Active Year and Semester',
              fields: fields,
              initialValue: initialValue,
            },
            disableClose: true,
          });

          // Update semester options and start/end dates when the year changes
          dialogRef.componentInstance.form
            .get('academicYear')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((selectedYear: string) => {
              const selectedYearObj = academicYears.find(
                (year) => year.academic_year === selectedYear
              );
              if (selectedYearObj) {
                dialogRef.componentInstance.form.get('semester')?.reset();
                dialogRef.componentInstance.data.fields[1].options =
                  selectedYearObj.semesters.map(
                    (semester: Semester) => semester.semester_number
                  );

                // Automatically select the first semester and update dates
                if (selectedYearObj.semesters.length > 0) {
                  const firstSemester = selectedYearObj.semesters[0];
                  dialogRef.componentInstance.form
                    .get('semester')
                    ?.setValue(firstSemester.semester_number);
                  dialogRef.componentInstance.form
                    .get('startDate')
                    ?.setValue(firstSemester.start_date);
                  dialogRef.componentInstance.form
                    .get('endDate')
                    ?.setValue(firstSemester.end_date);
                }
              }
            });

          // Update start and end date when the semester changes
          dialogRef.componentInstance.form
            .get('semester')
            ?.valueChanges.pipe(takeUntil(this.destroy$))
            .subscribe((selectedSemesterNumber: string) => {
              const selectedYearObj = academicYears.find(
                (year) =>
                  year.academic_year ===
                  dialogRef.componentInstance.form.get('academicYear')?.value
              );
              if (selectedYearObj) {
                const selectedSemesterObj = selectedYearObj.semesters.find(
                  (semester) =>
                    semester.semester_number === selectedSemesterNumber
                );
                if (selectedSemesterObj) {
                  dialogRef.componentInstance.form
                    .get('startDate')
                    ?.setValue(selectedSemesterObj.start_date);
                  dialogRef.componentInstance.form
                    .get('endDate')
                    ?.setValue(selectedSemesterObj.end_date);
                }
              }
            });

          dialogRef
            .afterClosed()
            .pipe(takeUntil(this.destroy$))
            .subscribe((result) => {
              if (result) {
                const selectedYearObj = academicYears.find(
                  (year) => year.academic_year === result.academicYear
                );
                const selectedSemesterObj = selectedYearObj?.semesters.find(
                  (semester) => semester.semester_number === result.semester
                );

                if (selectedYearObj && selectedSemesterObj) {
                  const formattedStartDate = new Date(result.startDate)
                    .toISOString()
                    .split('T')[0];
                  const formattedEndDate = new Date(result.endDate)
                    .toISOString()
                    .split('T')[0];

                  const loadingSnackbarRef = this.snackBar.open(
                    'Loading...',
                    'Dismiss',
                    {
                      duration: undefined,
                    }
                  );

                  this.schedulingService
                    .setActiveYearAndSemester(
                      selectedYearObj.academic_year_id,
                      selectedSemesterObj.semester_id,
                      formattedStartDate,
                      formattedEndDate
                    )
                    .pipe(
                      switchMap(() => {
                        return this.loadActiveYearAndSemester();
                      }),
                      takeUntil(this.destroy$)
                    )
                    .subscribe({
                      next: () => {
                        this.activeYear = result.academicYear;
                        this.activeSemester = selectedSemesterObj.semester_id;

                        this.loadPrograms()
                          .pipe(switchMap(() => this.setDefaultSelections()))
                          .subscribe({
                            next: () => {
                              this.cdr.detectChanges();
                              loadingSnackbarRef.dismiss();
                              this.snackBar.open(
                                'Active year and semester have been updated successfully!',
                                'Close',
                                { duration: 3000 }
                              );
                            },
                            error: (err) => {
                              loadingSnackbarRef.dismiss();
                              this.handleError(
                                'Error loading programs after setting active year and semester'
                              )(err);
                            },
                          });
                      },
                      error: (err) => {
                        loadingSnackbarRef.dismiss();
                        this.handleError(
                          'Error setting active year and semester'
                        )(err);
                      },
                    });
                }
              }
            });
        })
      )
      .subscribe({
        error: this.handleError('Error fetching academic years'),
      });
  }

  // ====================
  // Helper Methods
  // ====================

  private handleError(message: string) {
    return (error: any): void => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', {
        duration: 3000,
      });
    };
  }

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
}
