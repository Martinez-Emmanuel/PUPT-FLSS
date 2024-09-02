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

import { SchedulingService, Schedule, Program, Curriculum } from '../../../services/admin/scheduling/scheduling.service';

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
  sectionOptions: string[] = ['1'];
  selectedProgram = '';
  selectedYear = 1;
  selectedSection = '1';
  selectedCurriculum = '';
  activeYear = '2023-2024';
  activeSemester = '1st Semester';
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
  academicYearOptions: string[] = ['2023-2024', '2022-2023', '2021-2022'];
  semesterOptions: string[] = [
    '1st Semester',
    '2nd Semester',
    'Summer Semester',
  ];

  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.fetchInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Initialization
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

  // Data Fetching
  private fetchInitialData() {
    forkJoin({
      programs: this.schedulingService.getPrograms(),
      curriculums: this.schedulingService.getCurriculums(),
      professors: this.schedulingService.getProfessors(),
      rooms: this.schedulingService.getRooms(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: ({ programs, curriculums, professors, rooms }) => {
          this.populateOptions(programs, curriculums, professors, rooms);
          this.fetchSchedules();
        },
        error: this.handleError('Error fetching initial data'),
      });
  }

  private fetchSchedules() {
    this.schedulingService
      .getSchedules(
        this.selectedProgram,
        this.selectedYear,
        this.selectedCurriculum,
        this.selectedSection
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => (this.schedules = [...schedules]),
        error: this.handleError('Error fetching schedules'),
      });
  }

  // UI Events Handling
  onInputChange(values: { [key: string]: any }) {
    const { program, yearLevel, curriculum, section } = values;
    if (program !== undefined && program !== this.selectedProgram) {
      this.selectedProgram = program;
      this.updateYearLevels();
    }
    if (yearLevel !== undefined) this.selectedYear = yearLevel;
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
      if (result)
        this.updateSchedule({
          ...element,
          ...result,
          time: `${result.startTime} - ${result.endTime}`,
        });
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
          this.activeYear = result.academicYear;
          this.activeSemester = result.semester;
          this.snackBar.open(
            'Active year and semester updated successfully',
            'Close',
            { duration: 3000 }
          );
        }
      });
  }

  // Data Manipulation
  private addSection(sectionName: string) {
    if (!this.sectionOptions.includes(sectionName)) {
      this.sectionOptions.push(sectionName);
      this.sectionOptions.sort((a, b) =>
        a.localeCompare(b, undefined, { numeric: true })
      );
      this.headerInputFields = [...this.headerInputFields];
      this.snackBar.open('Section added successfully', 'Close', {
        duration: 3000,
      });
    } else {
      this.snackBar.open('Section already exists', 'Close', { duration: 3000 });
    }
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

  private updateYearLevels() {
    const program = this.headerInputFields[0].options?.find(
      (p) => p === this.selectedProgram
    ) as unknown as Program;
    if (program) {
      this.headerInputFields[1].options = Array.from(
        { length: program.number_of_years },
        (_, i) => i + 1
      );
      this.selectedYear = 1;
    }
  }

  // Error Handling
  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', {
        duration: 3000,
      });
    };
  }
}
