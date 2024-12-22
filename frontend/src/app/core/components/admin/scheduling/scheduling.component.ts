import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable, Subject, forkJoin, of } from 'rxjs';
import { takeUntil, switchMap, tap, map, catchError } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogSchedulingComponent } from '../../../../shared/dialog-scheduling/dialog-scheduling.component';
import { DialogGenericComponent } from '../../../../shared/dialog-generic/dialog-generic.component';
import { DialogInfoComponent } from '../../../../shared/dialog-info/dialog-info.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { SchedulingService, CacheType } from '../../../services/admin/scheduling/scheduling.service';
import { AcademicYearService } from '../../../services/admin/academic-year/academic-year.service';
import {
  Schedule,
  AcademicYear,
  Semester,
  Program,
  YearLevel,
  PopulateSchedulesResponse,
  CourseResponse,
  ProgramOption,
  SectionOption,
  YearLevelOption,
} from '../../../models/scheduling.model';

import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-scheduling',
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
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
  isSubmissionEnabled: number = 0;

  private destroy$ = new Subject<void>();
  private readonly DIALOG_INFO_PREF_KEY = 'doNotShowDialogInfo';

  constructor(
    private schedulingService: SchedulingService,
    private academicYearService: AcademicYearService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeHeaderInputFields();
    this.initializeDisplayedColumns();
    this.generateTimeOptions();
    this.schedulingService.resetCaches([CacheType.Schedules]);

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

          if (this.isSubmissionEnabled === 1 && !this.shouldSkipDialog()) {
            this.openInfoDialog();
          }
        },
        error: this.handleError('Error initializing scheduling component'),
      });
  }

  ngOnDestroy(): void {
    this.schedulingService.resetCaches([CacheType.Preferences]);
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
      // 'tuition_hours',
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
    return this.academicYearService.getActiveYearAndSemester().pipe(
      tap(({ activeYear, activeSemester, startDate, endDate }) => {
        this.activeYear = activeYear;
        this.activeSemester = activeSemester;
        this.startDate = startDate;
        this.endDate = endDate;
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

  // ===========================
  // Selection and Data Handling
  // ===========================

  private setDefaultSelections(): Observable<void> {
    return new Observable<void>((observer) => {
      if (this.programOptions.length > 0) {
        const defaultProgram = this.programOptions[0];
        this.selectedProgram = defaultProgram.display;
        this.previousProgram = defaultProgram.display;

        this.yearLevelOptions = defaultProgram.year_levels;

        this.headerInputFields.find(
          (field) => field.key === 'program'
        )!.options = this.programOptions.map((p) => p.display);

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
          )!.options = this.sectionOptions.map(
            (section) => section.section_name
          );

          if (this.sectionOptions.length > 0) {
            this.selectedSection = this.sectionOptions[0].section_name;

            // Fetch courses with default selections
            const selectedProgram = this.programOptions.find(
              (p) => p.display === this.selectedProgram
            );
            const selectedSection = this.sectionOptions.find(
              (section) => section.section_name === this.selectedSection
            );

            if (selectedProgram && selectedSection) {
              this.fetchCourses(
                selectedProgram.id,
                this.selectedYear,
                selectedSection.section_id
              ).subscribe({
                next: () => {
                  observer.next();
                  observer.complete();
                },
                error: this.handleError(
                  'Failed to fetch courses on initial load'
                ),
              });
            } else {
              observer.next();
              observer.complete();
            }
          } else {
            observer.next();
            observer.complete();
          }
        } else {
          observer.next();
          observer.complete();
        }
      } else {
        observer.next();
        observer.complete();
      }
    });
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
    return this.schedulingService.populateSchedules().pipe(
      tap((response: PopulateSchedulesResponse) => {
        const program = response.programs.find(
          (p) => p.program_id === programId
        );
        if (!program) {
          this.schedules = [];
          return;
        }

        const yearLevelData = program.year_levels.find(
          (yl) => yl.year_level === yearLevel
        );
        if (!yearLevelData) {
          this.schedules = [];
          return;
        }

        const semesterData = yearLevelData.semesters.find(
          (s) => s.semester === response.semester_id
        );
        if (!semesterData) {
          this.schedules = [];
          return;
        }

        const sectionData = semesterData.sections.find(
          (s) => s.section_per_program_year_id === sectionId
        );
        if (!sectionData) {
          this.schedules = [];
          return;
        }

        this.isSubmissionEnabled = response.is_submission_enabled;

        this.schedules = sectionData.courses.map(
          (course: CourseResponse, index, array) => {
            const isLastInGroup =
              index === array.length - 1 ||
              course.course_code !== array[index + 1].course_code;

            return {
              schedule_id: course.schedule?.schedule_id,
              section_course_id: course.section_course_id,
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
              is_copy: course.is_copy || 0,
              isLastInGroup,
            };
          }
        );

        // Sort schedules for a consistent display order
        this.schedules.sort((a, b) => {
          if (a.course_code === b.course_code) {
            return a.is_copy - b.is_copy;
          }
          return a.course_code.localeCompare(b.course_code);
        });

        this.cdr.detectChanges();
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

  openInfoDialog(): void {
    const dialogRef = this.dialog.open(DialogInfoComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.doNotShowAgain) {
        this.setSkipDialogFlag();
      }
    });
  }

  openActiveYearSemesterDialog(): void {
    this.academicYearService
      .getAcademicYears()
      .pipe(
        takeUntil(this.destroy$),
        tap((academicYears: AcademicYear[]) => {
          if (!academicYears.length) {
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
                startDate: this.startDate ? new Date(this.startDate) : null,
                endDate: this.endDate ? new Date(this.endDate) : null,
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
            .pipe(
              takeUntil(this.destroy$),
              switchMap((result) => {
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

                    this.schedulingService.resetCaches([
                      CacheType.Rooms,
                      CacheType.Faculty,
                      CacheType.Schedules,
                      CacheType.Preferences,
                    ]);

                    return this.academicYearService
                      .setActiveYearAndSemester(
                        selectedYearObj.academic_year_id,
                        selectedSemesterObj.semester_id,
                        formattedStartDate,
                        formattedEndDate
                      )
                      .pipe(
                        switchMap(() =>
                          this.academicYearService.getActiveYearAndSemester()
                        ),
                        switchMap((activeYearData) => {
                          this.activeYear = result.academicYear;
                          this.activeSemester = selectedSemesterObj.semester_id;
                          this.startDate = activeYearData.startDate;
                          this.endDate = activeYearData.endDate;
                          return this.schedulingService.getActiveYearLevelsCurricula();
                        }),
                        tap((programsData) => {
                          this.programOptions = programsData.map((program) => ({
                            display: `${program.program_code} - ${program.program_title}`,
                            id: program.program_id,
                            year_levels: program.year_levels.map(
                              (year: YearLevel) => ({
                                year_level: year.year_level,
                                curriculum_id: year.curriculum_id,
                                sections: year.sections,
                              })
                            ),
                          }));

                          this.headerInputFields.find(
                            (field) => field.key === 'program'
                          )!.options = this.programOptions.map(
                            (p) => p.display
                          );
                        }),
                        switchMap(() => this.setDefaultSelections()),
                        switchMap(() => {
                          if (
                            this.selectedProgram &&
                            this.selectedYear &&
                            this.selectedSection
                          ) {
                            const program = this.programOptions.find(
                              (p) => p.display === this.selectedProgram
                            );
                            const section = this.sectionOptions.find(
                              (s) => s.section_name === this.selectedSection
                            );
                            if (program && section) {
                              return this.fetchCourses(
                                program.id,
                                this.selectedYear,
                                section.section_id
                              );
                            }
                          }
                          return of([]);
                        })
                      );
                  }
                }
                return of(null);
              })
            )
            .subscribe({
              next: (result) => {
                if (result) {
                  this.snackBar.open(
                    'New active year and semester has been set successfully.',
                    'Close',
                    { duration: 3000 }
                  );
                }
              },
              error: (err) => {
                this.handleError('Error updating active year and semester')(
                  err
                );
              },
            });
        })
      )
      .subscribe({
        error: this.handleError('Error fetching academic years'),
      });
  }

  openEditScheduleDialog(schedule: Schedule) {
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

        const selectedProgramInfo = `${schedule?.program_code} ${this.selectedYear}-${this.selectedSection}`;
        const selectedCourseInfo = `${schedule.course_code} - ${schedule.course_title}`;
        const section = this.sectionOptions.find(
          (s) => s.section_name === schedule.section
        );

        const sectionId = section ? section.section_id : null;

        // =======================
        // Updated SuggestedFaculty
        // =======================
        interface Preference {
          day: string;
          time: string;
        }

        interface SuggestedFaculty {
          faculty_id: number;
          name: string;
          type: string;
          preferences: Preference[];
          prefIndex: number;
        }

        const suggestedFaculty: SuggestedFaculty[] = [];

        preferences.preferences.forEach((pref) => {
          const facultyDetails = faculty.faculty.find(
            (f) => f.faculty_id === pref.faculty_id
          );
          if (!facultyDetails) {
            return;
          }

          pref.active_semesters.forEach((semester) => {
            semester.courses.forEach((course) => {
              if (course.course_details.course_id === schedule.course_id) {
                const existingFaculty = suggestedFaculty.find(
                  (f) => f.faculty_id === facultyDetails.faculty_id
                );

                const facultyPref: SuggestedFaculty = {
                  faculty_id: facultyDetails.faculty_id,
                  name: pref.faculty_name,
                  type: facultyDetails.faculty_type,
                  preferences: course.preferred_days.map((prefDay) => ({
                    day: prefDay.day,
                    time: `${this.formatTimeFromBackend(
                      prefDay.start_time
                    )} - ${this.formatTimeFromBackend(prefDay.end_time)}`,
                  })),
                  prefIndex: 0,
                };

                if (existingFaculty) {
                  existingFaculty.preferences.push(...facultyPref.preferences);
                } else {
                  suggestedFaculty.push(facultyPref);
                }
              }
            });
          });
        });

        const dialogRef = this.dialog.open(DialogSchedulingComponent, {
          maxWidth: '50rem',
          width: '100%',
          disableClose: true,
          data: {
            program: {
              id: program?.id || 0,
              info: selectedProgramInfo,
            },
            academic: {
              year_level: this.selectedYear,
              section_id: sectionId || 0,
            },
            options: {
              dayOptions: this.dayOptions,
              timeOptions: this.timeOptions,
              endTimeOptions: this.timeOptions,
              professorOptions: professorOptions,
              roomOptions: roomOptions,
            },
            facultyOptions: faculty.faculty,
            roomOptionsList: availableRooms,
            selectedProgramInfo: selectedProgramInfo,
            selectedCourseInfo: selectedCourseInfo,
            suggestedFaculty: suggestedFaculty,
            existingSchedule: {
              day: schedule.day,
              time: schedule.time,
              professor: schedule.professor,
              room: schedule.room,
            },
            schedule_id: schedule.schedule_id,
            course_id: schedule.course_id,
          },
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            this.snackBar.open(
              `Schedule for ${schedule.course_code} - ${schedule.course_title} 
                has been successfully updated.`,
              'Close',
              { duration: 3000 }
            );
            this.schedulingService.resetCaches([CacheType.Schedules]);
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
  // Course Copy Methods
  // ====================

  addCourseCopy(element: Schedule): void {
    this.schedulingService
      .duplicateCourse(element)
      .pipe(
        switchMap(() => {
          this.schedulingService.resetCaches([CacheType.Schedules]);
          return this.fetchCourses(
            this.programOptions.find((p) => p.display === this.selectedProgram)
              ?.id || 0,
            this.selectedYear,
            this.sectionOptions.find(
              (s) => s.section_name === this.selectedSection
            )?.section_id || 0
          );
        })
      )
      .subscribe({
        next: (updatedSchedules) => {
          this.schedules = updatedSchedules;
          this.cdr.detectChanges();

          // Find the updated count for the course
          const scheduleCount = this.getScheduleCount(element);
          const scheduleIndex = this.getOrdinalSuffix(scheduleCount);

          this.snackBar.open(
            `${scheduleIndex} schedule successfully added for ${element.course_code} - ${element.course_title}`,
            'Close',
            { duration: 3000 }
          );
        },
        error: (error) => {
          this.handleError('Failed to add course copy')(error);
        },
      });
  }

  removeCourseCopy(element: Schedule): void {
    const scheduleIndex = this.getScheduleIndex(element);
    const courseCode = element.course_code;
    const courseTitle = element.course_title;

    const dialogRef = this.dialog.open(DialogGenericComponent, {
      data: {
        title: `Remove ${this.getOrdinalSuffix(scheduleIndex)} schedule`,
        content: `Are you sure you want to remove the ${this.getOrdinalSuffix(
          scheduleIndex
        )} schedule for ${courseCode} - ${courseTitle}? This action cannot be undone.`,
        actionText: 'Remove',
        cancelText: 'Cancel',
        action: 'remove',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'remove') {
        this.schedulingService
          .removeDuplicateCourse(element.section_course_id)
          .pipe(
            tap(() => {
              this.schedulingService.resetCaches([CacheType.Schedules]);
            }),
            switchMap(() => {
              const program = this.programOptions.find(
                (p) => p.display === this.selectedProgram
              );
              const section = this.sectionOptions.find(
                (s) => s.section_name === this.selectedSection
              );
              return program && section
                ? this.fetchCourses(
                    program.id,
                    this.selectedYear,
                    section.section_id
                  )
                : of([]);
            })
          )
          .subscribe({
            next: (updatedSchedules) => {
              this.schedules = updatedSchedules;
              this.cdr.detectChanges();

              this.snackBar.open(
                `${this.getOrdinalSuffix(
                  scheduleIndex
                )} schedule for ${courseCode} - ${courseTitle} removed successfully.`,
                'Close',
                { duration: 3000 }
              );
            },
            error: this.handleError('Failed to remove course copy'),
          });
      }
    });
  }

  // ====================
  // Helper Methods
  // ====================

  private handleError(message: string) {
    return (error: any): void => {
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

  protected hasCopies(element: Schedule): boolean {
    return (
      this.schedules.filter(
        (schedule) => schedule.course_code === element.course_code
      ).length > 1
    );
  }

  protected getOrdinalSuffix(i: number): string {
    const j = i % 10,
      k = i % 100;
    if (j === 1 && k !== 11) {
      return i + 'st';
    }
    if (j === 2 && k !== 12) {
      return i + 'nd';
    }
    if (j === 3 && k !== 13) {
      return i + 'rd';
    }
    return i + 'th';
  }

  protected getScheduleCount(element: Schedule): number {
    return this.schedules.filter(
      (schedule) => schedule.course_code === element.course_code
    ).length;
  }

  protected getScheduleIndex(element: Schedule): number {
    return (
      this.schedules
        .filter((schedule) => schedule.course_code === element.course_code)
        .findIndex((schedule) => schedule.schedule_id === element.schedule_id) +
      1
    );
  }

  protected isLastCopy(element: Schedule, currentIndex: number): boolean {
    if (currentIndex === this.schedules.length - 1) return true;
    const nextSchedule = this.schedules[currentIndex + 1];

    return (
      this.hasCopies(element) &&
      element.course_code !== nextSchedule.course_code
    );
  }

  private shouldSkipDialog(): boolean {
    return localStorage.getItem(this.DIALOG_INFO_PREF_KEY) === 'true';
  }

  private setSkipDialogFlag(): void {
    localStorage.setItem(this.DIALOG_INFO_PREF_KEY, 'true');
  }
}
