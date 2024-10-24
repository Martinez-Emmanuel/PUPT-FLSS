import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, tap, map, catchError } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogSchedulingComponent } from '../../../../shared/dialog-scheduling/dialog-scheduling.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import {
  SchedulingService,
  Schedule,
  Program,
  AcademicYear,
  Semester,
  YearLevel,
  PopulateSchedulesResponse,
  CourseResponse,
  SubmittedPrefResponse,
} from '../../../services/admin/scheduling/scheduling.service';

import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

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
    MatProgressSpinnerModule,
    MatSymbolDirective,
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
  academicYearOptions: AcademicYear[] = [];
  semesterOptions: Semester[] = [];
  programs: Program[] = [];
  timeOptions: string[] = [];
  dayOptions: string[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
  ];
  endTimeOptions: string[] = [];

  selectedProgram: string = '';
  selectedYear: number = 1;
  selectedSection: string = '';
  selectedCurriculumId: number | null = null;

  previousProgram: string = '';
  previousYear: number = 1;

  activeYear: string = '';
  activeSemester: number = 0;
  startDate: string = '';
  endDate: string = '';

  displayedColumns: string[] = [];
  headerInputFields: InputField[] = [];
  isLoading = true;
  loadingScheduleId: number | null = null;

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

    forkJoin({
      activeYearSemester: this.loadActiveYearAndSemester(),
      programs: this.loadPrograms(),
      viewPreferences: this.loadViewPreferences(),
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

  // ======================
  // Initialization Methods
  // ======================

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
      map(() => void 0),
      catchError((error) => {
        this.handleError('Failed to load active year and semester')(error);
        return of(void 0);
      })
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

  private loadViewPreferences(): Observable<SubmittedPrefResponse> {
    return this.schedulingService
      .getSubmittedPreferencesForActiveSemester()
      .pipe(
        tap((preferences) => {
          console.log('Loaded view preferences:', preferences);
        }),
        catchError((error) => {
          console.error('Failed to load view preferences:', error);
          this.snackBar.open(
            'Failed to load view preferences. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
          return of({} as SubmittedPrefResponse);
        })
      );
  }

  // ===========================
  // Selection and Data Handling
  // ===========================

  private setDefaultSelections(): Observable<void> {
    if (this.programOptions.length > 0) {
      const defaultProgram = this.programOptions[0];
      this.selectedProgram = defaultProgram.display;
      this.previousProgram = defaultProgram.display;

      this.yearLevelOptions = defaultProgram.year_levels;

      this.headerInputFields.find((field) => field.key === 'program')!.options =
        this.programOptions.map((p) => p.display);

      this.headerInputFields.find(
        (field) => field.key === 'yearLevel'
      )!.options = this.yearLevelOptions.map((year) => year.year_level);

      if (this.yearLevelOptions.length > 0) {
        const defaultYearLevel = this.yearLevelOptions[0];
        this.selectedYear = defaultYearLevel.year_level;
        this.previousYear = defaultYearLevel.year_level;
        this.selectedCurriculumId = defaultYearLevel.curriculum_id;

        this.sectionOptions = defaultYearLevel.sections.sort((a, b) =>
          a.section_name.localeCompare(b.section_name)
        );

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

  protected onInputChange(values: { [key: string]: any }): void {
    const selectedProgramDisplay = values['program'];
    const selectedYearLevel = values['yearLevel'];
    const selectedSectionDisplay = values['section'];

    let programChanged = selectedProgramDisplay !== this.previousProgram;
    let yearLevelChanged = selectedYearLevel !== this.previousYear;

    const selectedProgram = this.programOptions.find(
      (p) => p.display === selectedProgramDisplay
    );

    if (!selectedProgram) {
      console.log('No program found.');
      this.schedules = [];
      return;
    }

    this.selectedProgram = selectedProgramDisplay;

    this.yearLevelOptions = selectedProgram.year_levels;

    this.headerInputFields.find((field) => field.key === 'yearLevel')!.options =
      this.yearLevelOptions.map((year) => year.year_level);

    if (programChanged) {
      if (this.yearLevelOptions.length > 0) {
        this.selectedYear = this.yearLevelOptions[0].year_level;
        yearLevelChanged = true;
        this.previousYear = this.selectedYear;
      }
    } else if (yearLevelChanged) {
      this.selectedYear = selectedYearLevel;
      this.previousYear = this.selectedYear;
    }

    const selectedYearLevelObj = this.yearLevelOptions.find(
      (year) => year.year_level === this.selectedYear
    );

    if (!selectedYearLevelObj) {
      console.log('No year level found.');
      this.schedules = [];
      return;
    }

    this.selectedCurriculumId = selectedYearLevelObj.curriculum_id;
    this.sectionOptions = selectedYearLevelObj.sections.sort((a, b) =>
      a.section_name.localeCompare(b.section_name)
    );

    this.headerInputFields.find((field) => field.key === 'section')!.options =
      this.sectionOptions.map((section) => section.section_name);

    if (programChanged || yearLevelChanged) {
      if (this.sectionOptions.length > 0) {
        this.selectedSection = this.sectionOptions[0].section_name;
      } else {
        this.selectedSection = '';
      }
    } else {
      this.selectedSection = selectedSectionDisplay;
    }

    const selectedSection = this.sectionOptions.find(
      (section) => section.section_name === this.selectedSection
    );

    if (!selectedSection) {
      console.log('No section found.');
      this.schedules = [];
      return;
    }

    this.fetchCourses(
      selectedProgram.id,
      this.selectedYear,
      selectedSection.section_id
    ).subscribe({
      next: () => {},
      error: this.handleError('Failed to fetch courses'),
    });

    this.previousProgram = this.selectedProgram;
  }

  private fetchCourses(
    programId: number,
    yearLevel: number,
    sectionId: number
  ): Observable<Schedule[]> {
    console.log(
      `Fetching courses for Program ID: ${programId}, 
      Year Level: ${yearLevel},
      Section ID: ${sectionId}`
    );
    return this.schedulingService.populateSchedules().pipe(
      tap((response: PopulateSchedulesResponse) => {
        // Find the selected program
        console.log('Response', response);

        const program = response.programs.find(
          (p) => p.program_id === programId
        );
        if (!program) {
          console.error('Program not found');
          this.schedules = [];
          return;
        }

        // Find the selected year level
        const yearLevelData = program.year_levels.find(
          (yl) => yl.year_level === yearLevel
        );
        if (!yearLevelData) {
          console.error('Year level not found');
          this.schedules = [];
          return;
        }

        // Find the active semester within the year level
        const semesterData = yearLevelData.semesters.find(
          (s) => s.semester === response.semester_id
        );
        if (!semesterData) {
          console.error('Semester not found');
          this.schedules = [];
          return;
        }

        // Find the selected section within the semester
        const sectionData = semesterData.sections.find(
          (s) => s.section_per_program_year_id === sectionId
        );
        if (!sectionData) {
          console.error('Section not found');
          this.schedules = [];
          return;
        }

        // Map the courses to the Schedule interface
        this.schedules = sectionData.courses.map((course: CourseResponse) => ({
          schedule_id: course.schedule?.schedule_id,
          course_id: course.course_id,
          course_code: course.course_code,
          course_title: course.course_title,
          lec_hours: course.lec_hours,
          lab_hours: course.lab_hours,
          units: course.units,
          tuition_hours: course.tuition_hours,
          day: course.schedule?.day || 'Not set',
          time: this.getFormattedTime(
            course.schedule?.start_time,
            course.schedule?.end_time
          ),
          professor: course.professor || 'Not set',
          room: course.room?.room_code || 'Not set',
          program: program.program_title,
          program_code: program.program_code,
          year: yearLevelData.year_level,
          curriculum: yearLevelData.curriculum_year,
          section: sectionData.section_name,
        }));

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

          const dialogRef = this.dialog.open(TableDialogComponent, {
            data: {
              title: 'Set Active Year and Semester',
              fields: fields,
              initialValue: {
                academicYear: this.activeYear || academicYearOptions[0] || '',
                semester: this.activeSemesterLabel || semesterOptions[0] || '',
                startDate: this.startDate || null,
                endDate: this.endDate || null,
              },
            },
            disableClose: true,
          });

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
                    ?.get('semester')
                    ?.setValue(firstSemester.semester_number);
                  dialogRef.componentInstance.form
                    ?.get('startDate')
                    ?.setValue(firstSemester.start_date);
                  dialogRef.componentInstance.form
                    ?.get('endDate')
                    ?.setValue(firstSemester.end_date);
                }
              }
            });

          dialogRef.componentInstance.form
            ?.get('semester')
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
                    ?.get('startDate')
                    ?.setValue(selectedSemesterObj.start_date);
                  dialogRef.componentInstance.form
                    ?.get('endDate')
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
                  const formattedStartDate = this.formatDateToYMD(
                    new Date(result.startDate)
                  );
                  const formattedEndDate = this.formatDateToYMD(
                    new Date(result.endDate)
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

                        this.schedulingService.resetCaches();

                        this.loadPrograms()
                          .pipe(switchMap(() => this.setDefaultSelections()))
                          .subscribe({
                            next: () => {
                              dialogRef.close();
                              this.snackBar.open(
                                'New active year and semester has been set successfully.',
                                'Close',
                                { duration: 3000 }
                              );
                            },
                            error: (err) => {
                              this.handleError(
                                'Error loading programs after setting active year and semester'
                              )(err);
                            },
                          });
                      },
                      error: (err) => {
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

  openEditDialog(schedule: Schedule) {
    if (!schedule.schedule_id) {
      this.snackBar.open('Schedule ID is missing.', 'Close', {
        duration: 3000,
      });
      return;
    }

    this.loadingScheduleId = schedule.schedule_id;

    forkJoin({
      rooms: this.schedulingService.getAllRooms(),
      faculty: this.schedulingService.getFacultyDetails(),
      preferences:
        this.schedulingService.getSubmittedPreferencesForActiveSemester(),
    }).subscribe({
      next: ({ rooms, faculty, preferences }) => {
        this.loadingScheduleId = null;
        const availableRooms = rooms.rooms.filter(
          (room) => room.status === 'Available'
        );

        const roomOptions = availableRooms.map((room) => room.room_code);
        const professorOptions = faculty.faculty.map(
          (professor) => professor.name
        );
        const program = this.programOptions.find(
          (p) => p.display === this.selectedProgram
        );
        const selectedProgramInfo = `${schedule.program_code} ${schedule.year}-${schedule.section}`;
        const selectedCourseInfo = `${schedule.course_code} - ${schedule.course_title}`;

        const suggestedFaculty: {
          name: string;
          type: string;
          day: string;
          time: string;
        }[] = [];

        preferences.preferences.forEach((pref) => {
          const facultyDetails = faculty.faculty.find(
            (f) => f.faculty_id === pref.faculty_id
          );
          if (!facultyDetails) {
            console.warn(
              `Faculty details not found for faculty_id: ${pref.faculty_id}`
            );
            return;
          }

          pref.active_semesters.forEach((semester) => {
            semester.courses.forEach((course) => {
              if (course.course_details.course_id === schedule.course_id) {
                suggestedFaculty.push({
                  name: pref.faculty_name,
                  type: facultyDetails.faculty_type,
                  day: course.preferred_day,
                  time: `${this.formatTimeFromBackend(
                    course.preferred_start_time
                  )} - ${this.formatTimeFromBackend(
                    course.preferred_end_time
                  )}`,
                });
              }
            });
          });
        });

        const dialogRef = this.dialog.open(DialogSchedulingComponent, {
          maxWidth: '45rem',
          width: '100%',
          disableClose: true,
          data: {
            selectedProgramId: program?.id,
            year_level: this.selectedYear,
            section_id: this.selectedSection,
            dayOptions: this.dayOptions,
            timeOptions: this.timeOptions,
            endTimeOptions: this.timeOptions,
            professorOptions: professorOptions,
            roomOptions: roomOptions,
            facultyOptions: faculty.faculty,
            roomOptionsList: availableRooms,
            selectedProgramInfo: selectedProgramInfo,
            selectedCourseInfo: selectedCourseInfo,
            suggestedFaculty: suggestedFaculty,
            existingSchedule: schedule,
            schedule_id: schedule.schedule_id,
            course_id: schedule.course_id,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.snackBar.open(
              'Schedule has been successfully updated.',
              'Close',
              {
                duration: 3000,
              }
            );
            this.schedulingService.resetCaches();
            this.onInputChange({
              program: this.selectedProgram,
              yearLevel: this.selectedYear,
              section: this.selectedSection,
            });
          }
        });
      },
      error: (error) => {
        this.loadingScheduleId = null;
        this.handleError('Failed to fetch necessary data for editing schedule')(
          error
        );
      },
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

  private formatDateToYMD(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private generateTimeOptions() {
    const startHour = 7;
    const endHour = 21;

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = this.formatTime(hour, minute);
        this.timeOptions.push(time);
      }
    }
    this.timeOptions.push(this.formatTime(endHour, 0));
  }

  private formatTime(hour: number, minute: number): string {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute =
      minute === 0 ? '00' : minute.toString().padStart(2, '0');
    return `${displayHour}:${displayMinute} ${period}`;
  }

  private formatTimeFromString(timeStr: string | null | undefined): string {
    if (!timeStr) {
      return 'Not set';
    }
    const [hourStr, minuteStr, _] = timeStr.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    return this.formatTime(hour, minute);
  }

  private formatTimeFromBackend(timeStr: string): string {
    if (!timeStr) return 'Not set';
    const [hour, minute, second] = timeStr.split(':').map(Number);
    return this.formatTime(hour, minute);
  }

  private getFormattedTime(startTime?: string, endTime?: string): string {
    if (!startTime && !endTime) {
      return 'Not set';
    }

    const formattedStartTime = startTime
      ? this.formatTimeFromString(startTime)
      : 'Not set';
    const formattedEndTime = endTime
      ? this.formatTimeFromString(endTime)
      : 'Not set';

    if (formattedStartTime === 'Not set' && formattedEndTime === 'Not set') {
      return 'Not set';
    } else if (formattedStartTime === 'Not set') {
      return formattedEndTime;
    } else if (formattedEndTime === 'Not set') {
      return formattedStartTime;
    }

    return `${formattedStartTime} - ${formattedEndTime}`;
  }

  protected get activeSemesterLabel(): string {
    return this.mapSemesterNumberToLabel(this.activeSemester);
  }
}
