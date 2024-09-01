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
  selectedProgram = '';
  selectedYear = 1;
  selectedCurriculum = '';
  activeYear = '2023-2024';
  activeSemester = '1st Semester';
  private destroy$ = new Subject<void>();

  headerInputFields: InputField[] = [
    { type: 'select', label: 'Program', key: 'program', options: [] },
    { type: 'select', label: 'Year Level', key: 'yearLevel', options: [] },
    { type: 'select', label: 'Curriculum', key: 'curriculum', options: [] },
  ];

  displayedColumns: string[] = [
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
  academicYearOptions: string[] = ['2023-2024', '2024-2025', '2025-2026'];
  semesterOptions: string[] = ['1st Semester', '2nd Semester', 'Summer Semester'];

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
        this.updateProgramOptions(programs);
        this.updateCurriculumOptions(curriculums);
        this.professorOptions = professors;
        this.roomOptions = rooms;
        this.fetchSchedules();
      },
      error: this.handleError('Error fetching initial data'),
    });
  }

  private updateProgramOptions(programs: Program[]) {
    this.headerInputFields[0].options = programs.map((p) => p.name);
    if (programs.length > 0) {
      this.selectedProgram = programs[0].name;
      this.updateYearLevels(programs[0]);
    }
  }

  private updateCurriculumOptions(curriculums: Curriculum[]) {
    this.headerInputFields[2].options = curriculums.map((c) => c.name);
    if (curriculums.length > 0) {
      this.selectedCurriculum = curriculums[0].name;
    }
  }

  private updateYearLevels(program: Program) {
    this.headerInputFields[1].options = Array.from(
      { length: program.number_of_years },
      (_, i) => i + 1
    );
    this.selectedYear = 1;
  }

  private fetchSchedules() {
    this.schedulingService
      .getSchedules(
        this.selectedProgram,
        this.selectedYear,
        this.selectedCurriculum
      )
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => (this.schedules = schedules),
        error: this.handleError('Error fetching schedules'),
      });
  }

  onInputChange(values: { [key: string]: any }) {
    if (
      values['program'] !== undefined &&
      values['program'] !== this.selectedProgram
    ) {
      this.selectedProgram = values['program'];
      const program = this.headerInputFields[0].options?.find(
        (p) => p === this.selectedProgram
      );
      if (program) {
        this.updateYearLevels(program as unknown as Program);
      }
    }
    if (values['yearLevel'] !== undefined) {
      this.selectedYear = values['yearLevel'];
    }
    if (values['curriculum'] !== undefined) {
      this.selectedCurriculum = values['curriculum'];
    }
    this.fetchSchedules();
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
        day: element.day,
        startTime: element.time.split(' - ')[0],
        endTime: element.time.split(' - ')[1],
        professor: element.professor,
        room: element.room,
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
        const updatedSchedule = {
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

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.activeYear = result.academicYear;
        this.activeSemester = result.semester;
        this.snackBar.open('Active year and semester updated successfully', 'Close', {
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

  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', {
        duration: 3000,
      });
    };
  }
}
