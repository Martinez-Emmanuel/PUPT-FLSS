import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
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
  private destroy$ = new Subject<void>();

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
    {
      type: 'select',
      label: 'Curriculum',
      key: 'curriculum',
      options: [],
    },
  ];

  displayedColumns: string[] = [
    'index', 'course_code', 'course_title', 'lec_hours', 'lab_hours',
    'units', 'tuition_hours', 'day', 'time', 'professor', 'room', 'action'
  ];

  dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeOptions: string[] = this.generateTimeOptions();
  professorOptions = ['Geneva Urizar', 'Steven Villarosa', 'Jennifer Ortega', 'AJ San Luis', 'Gecilie Almiranez'];
  roomOptions = ['101', '102', '103', '201', '202', '203', 'DOST Lab'];

  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.fetchInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  generateTimeOptions(): string[] {
    const options: string[] = [];
    for (let hour = 7; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 21 && minute > 0) break;
        const time = new Date(2023, 0, 1, hour, minute);
        options.push(time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
      }
    }
    return options;
  }

  fetchInitialData() {
    this.schedulingService.getPrograms().pipe(takeUntil(this.destroy$)).subscribe({
      next: (programs) => {
        this.headerInputFields[0].options = programs.map(p => p.name);
        if (programs.length > 0) {
          this.selectedProgram = programs[0].name;
          this.updateYearLevels(programs[0]);
          this.fetchCurriculums();
        }
      },
      error: this.handleError('Error fetching programs')
    });
  }

  updateYearLevels(program: Program) {
    this.headerInputFields[1].options = Array.from({ length: program.number_of_years }, (_, i) => i + 1);
    this.selectedYear = 1;
  }

  fetchCurriculums() {
    this.schedulingService.getCurriculums().pipe(takeUntil(this.destroy$)).subscribe({
      next: (curriculums) => {
        this.headerInputFields[2].options = curriculums.map(c => c.name);
        if (curriculums.length > 0) {
          this.selectedCurriculum = curriculums[0].name;
          this.fetchSchedules();
        }
      },
      error: this.handleError('Error fetching curriculums')
    });
  }

  fetchSchedules() {
    this.schedulingService.getSchedules(this.selectedProgram, this.selectedYear, this.selectedCurriculum)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => this.schedules = schedules,
        error: this.handleError('Error fetching schedules')
      });
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['program'] !== undefined && values['program'] !== this.selectedProgram) {
      this.selectedProgram = values['program'];
      const program = this.headerInputFields[0].options?.find(p => p === this.selectedProgram);
      if (program) {
        this.updateYearLevels(program as unknown as Program);
        this.fetchCurriculums();
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
        { label: 'Day', formControlName: 'day', type: 'autocomplete', options: this.dayOptions, required: true },
        { label: 'Start Time', formControlName: 'startTime', type: 'autocomplete', options: this.timeOptions, required: true },
        { label: 'End Time', formControlName: 'endTime', type: 'autocomplete', options: this.timeOptions, required: true },
        { label: 'Professor', formControlName: 'professor', type: 'autocomplete', options: this.professorOptions, required: true },
        { label: 'Room', formControlName: 'room', type: 'autocomplete', options: this.roomOptions, required: true },
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
  
    const dialogRef = this.dialog.open(TableDialogComponent, { data: dialogConfig });
  
    dialogRef.componentInstance.startTimeChange.subscribe((startTime: string) => {
      const startIndex = this.timeOptions.indexOf(startTime);
      dialogRef.componentInstance.updateEndTimeOptions(this.timeOptions.slice(startIndex + 1));
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const updatedSchedule = {
          ...element,
          ...result,
          time: `${result.startTime} - ${result.endTime}`
        };
        this.updateSchedule(updatedSchedule);
      }
    });
  }
  
  

  updateSchedule(updatedSchedule: Schedule) {
    this.schedulingService.updateSchedule(updatedSchedule).pipe(takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.snackBar.open('Schedule updated successfully', 'Close', { duration: 3000 });
        this.fetchSchedules();
      },
      error: this.handleError('Error updating schedule')
    });
  }

  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
      this.snackBar.open(`${message}. Please try again.`, 'Close', { duration: 3000 });
    };
  }
}