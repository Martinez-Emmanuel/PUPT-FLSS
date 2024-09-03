import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

import { SchedulingService, Schedule, Program, Curriculum, AcademicYear, Semester } from '../../../services/admin/scheduling/scheduling.service';

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
  sectionOptions: string[] = [];
  selectedProgram = '';
  selectedYear = 1;
  selectedSection = '1';
  selectedCurriculum = '';

  activeYear: AcademicYear = '2023-2024';
  activeSemester: Semester = '2nd Semester';

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

  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchInitialData();
    this.fetchActiveYearAndSemester();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeHeaderInputFields(): InputField[] {
    return [
      { type: 'select', label: 'Program', key: 'program', options: [] },
      { type: 'select', label: 'Year Level', key: 'yearLevel', options: [] },
      { type: 'select', label: 'Curriculum', key: 'curriculum', options: [] },
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

  private fetchInitialData() {
    forkJoin({
      academicYears: this.schedulingService.getAcademicYears(),
      programs: this.schedulingService.getPrograms(),
      curriculums: this.schedulingService.getCurriculums(),
      professors: this.schedulingService.getProfessors(),
      rooms: this.schedulingService.getRooms(),
      sections: this.schedulingService.getSections(
        this.selectedProgram,
        this.selectedYear
      ),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({
          academicYears,
          programs,
          curriculums,
          professors,
          rooms,
          sections,
        }) => {
          this.academicYearOptions = academicYears.map(
            (ay) => ay.year as AcademicYear
          );
          this.semesterOptions = academicYears[0]?.semesters || [];
          this.populateOptions(programs, curriculums, professors, rooms);
          this.setProgramOptions(programs);
          this.sectionOptions = sections;
          this.headerInputFields.find(
            (field) => field.key === 'section'
          )!.options = sections;
          this.fetchSchedules();
        },
        error: this.handleError('Error fetching initial data'),
      });
  }

  private fetchActiveYearAndSemester() {
    this.schedulingService
      .getActiveYearAndSemester()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.activeYear = data.activeYear;
          this.activeSemester = data.activeSemester;
          this.fetchSchedules();
        },
        error: this.handleError('Error fetching active year and semester'),
      });
  }

  private fetchSchedules() {
    this.schedulingService
      .getSchedules(
        this.selectedProgram,
        this.selectedYear,
        this.selectedCurriculum,
        this.selectedSection,
        this.activeYear,
        this.activeSemester
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => (this.schedules = [...schedules]),
        error: this.handleError('Error fetching schedules'),
      });
  }

  private fetchSections(program: string, year: number) {
    this.schedulingService.getSections(program, year).subscribe((sections) => {
      this.sectionOptions = sections;
      this.headerInputFields.find((field) => field.key === 'section')!.options =
        sections;
      if (!sections.includes(this.selectedSection)) {
        this.selectedSection = sections[0] || '1';
      }
    });
  }

  private updateYearLevels() {
    const selectedProgram = this.programs.find(
      (p) => p.name === this.selectedProgram
    );
    if (selectedProgram) {
      this.headerInputFields[1].options = Array.from(
        { length: selectedProgram.number_of_years },
        (_, i) => i + 1
      );
      this.selectedYear = 1;
    } else {
      this.headerInputFields[1].options = [];
    }
  }

  private addSection(sectionName: string) {
    this.schedulingService
      .addSection(this.selectedProgram, this.selectedYear, sectionName)
      .subscribe((success) => {
        if (success) {
          this.fetchSections(this.selectedProgram, this.selectedYear);
          this.snackBar.open('Section added successfully', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open('Section already exists', 'Close', {
            duration: 3000,
          });
        }
      });
  }

  private updateSchedule(updatedSchedule: Schedule) {
    this.schedulingService
      .updateSchedule(updatedSchedule)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Schedule updated successfully', 'Close', {
            duration: 3000,
          });
          this.fetchSchedules();
        },
        error: this.handleError('Error updating schedule'),
      });
  }

  private populateOptions(
    programs: Program[],
    curriculums: Curriculum[],
    professors: string[],
    rooms: string[]
  ) {
    this.programs = programs;
    this.setProgramOptions(programs);
    this.setCurriculumOptions(curriculums);
    this.professorOptions = professors;
    this.roomOptions = rooms;
  }

  private setProgramOptions(programs: Program[]) {
    this.headerInputFields[0].options = programs.map((p) => p.name);
    if (programs.length > 0) {
      this.selectedProgram = programs[0].name;
      this.updateYearLevels();
    }
  }

  private setCurriculumOptions(curriculums: Curriculum[]) {
    this.headerInputFields[2].options = curriculums.map((c) => c.name);
    if (curriculums.length > 0) this.selectedCurriculum = curriculums[0].name;
  }

  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', {
        duration: 3000,
      });
    };
  }

  onInputChange(values: { [key: string]: any }) {
    const { program, yearLevel, curriculum, section } = values;
    if (program !== undefined && program !== this.selectedProgram) {
      this.selectedProgram = program;
      this.updateYearLevels();
      this.fetchSections(program, this.selectedYear);
    }
    if (yearLevel !== undefined) {
      this.selectedYear = yearLevel;
      this.fetchSections(this.selectedProgram, yearLevel);
    }
    if (curriculum !== undefined) this.selectedCurriculum = curriculum;
    if (section !== undefined) this.selectedSection = section;
    this.fetchSchedules();
  }

  openAddSectionDialog() {
    const dialogConfig: DialogConfig = {
      title: 'Add Section',
      fields: [
        {
          label: 'Section Name',
          formControlName: 'sectionName',
          type: 'text',
          required: true,
        },
      ],
      isEdit: false,
    };

    this.dialog
      .open(TableDialogComponent, { data: dialogConfig })
      .afterClosed()
      .subscribe((result) => {
        if (result) this.addSection(result.sectionName);
      });
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
    });

    dialogRef.componentInstance.startTimeChange.subscribe(
      (startTime: string) => {
        const startIndex = this.timeOptions.indexOf(startTime);
        dialogRef.componentInstance.updateEndTimeOptions(
          this.timeOptions.slice(startIndex + 1)
        );
      }
    );

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const updatedSchedule: Schedule = {
          ...element,
          ...result,
          time: `${result.startTime} - ${result.endTime}`,
        };
        this.updateSchedule(updatedSchedule);
      }
    });
  }

  openActiveYearSemesterDialog() {
    const dialogConfig: DialogConfig = {
      title: 'Set Active Year and Sem',
      fields: [
        {
          label: 'Academic Year',
          formControlName: 'academicYear',
          type: 'select',
          options: this.academicYearOptions,
          required: true,
        },
        {
          label: 'Semester',
          formControlName: 'semester',
          type: 'select',
          options: this.semesterOptions,
          required: true,
        },
      ],
      isEdit: false,
      initialValue: {
        academicYear: this.activeYear,
        semester: this.activeSemester,
      },
    };

    this.dialog
      .open(TableDialogComponent, { data: dialogConfig })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.schedulingService
            .setActiveYearAndSemester(
              result.academicYear as AcademicYear,
              result.semester as Semester
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.activeYear = result.academicYear as AcademicYear;
                this.activeSemester = result.semester as Semester;
                this.snackBar.open(
                  'Active year and semester updated successfully',
                  'Close',
                  { duration: 3000 }
                );
                this.fetchSchedules();
              },
              error: this.handleError('Error setting active year and semester'),
            });
        }
      });
  }
}
