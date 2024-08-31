import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';

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
  ],
  templateUrl: './scheduling.component.html',
  styleUrls: ['./scheduling.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class SchedulingComponent implements OnInit, OnDestroy {
  public schedules: Schedule[] = [];
  public selectedProgram: string = '';
  public selectedYear: number = 1;
  public selectedCurriculum: string = '';
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
    'units', 'tuition_hours', 'day', 'time', 'professor', 'room'
  ];

  dayOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  timeOptions = ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'];
  professorOptions = ['Prof. Smith', 'Prof. Johnson', 'Prof. Williams', 'Prof. Brown', 'Prof. Jones'];
  roomOptions = ['Room 101', 'Room 102', 'Room 103', 'Room 201', 'Room 202', 'Room 203'];

  constructor(
    private schedulingService: SchedulingService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchInitialData() {
    this.schedulingService.getPrograms().pipe(takeUntil(this.destroy$)).subscribe({
      next: (programs) => {
        this.headerInputFields[0].options = programs.map(p => p.name);
        if (programs.length > 0) {
          this.selectedProgram = programs[0].name;
          this.updateYearLevels(programs[0]);
          this.fetchCurriculums(programs[0].id);
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching programs:', error);
        this.snackBar.open('Error fetching programs. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  updateYearLevels(program: Program) {
    this.headerInputFields[1].options = Array.from({ length: program.number_of_years }, (_, i) => i + 1);
    this.selectedYear = 1;
  }

  fetchCurriculums(programId: number) {
    this.schedulingService.getCurriculums(programId).pipe(takeUntil(this.destroy$)).subscribe({
      next: (curriculums) => {
        this.headerInputFields[2].options = curriculums.map(c => c.name);
        if (curriculums.length > 0) {
          this.selectedCurriculum = curriculums[0].name;
          this.fetchSchedules();
        }
        this.cdr.markForCheck();
      },
      error: (error) => {
        console.error('Error fetching curriculums:', error);
        this.snackBar.open('Error fetching curriculums. Please try again.', 'Close', { duration: 3000 });
      }
    });
  }

  fetchSchedules() {
    this.schedulingService.getSchedules(this.selectedProgram, this.selectedYear, this.selectedCurriculum)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (schedules) => {
          this.schedules = schedules;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Error fetching schedules:', error);
          this.snackBar.open('Error fetching schedules. Please try again.', 'Close', { duration: 3000 });
        }
      });
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['program'] !== undefined && values['program'] !== this.selectedProgram) {
      this.selectedProgram = values['program'];
      const program = this.headerInputFields[0].options?.find(p => p === this.selectedProgram);
      if (program) {
        this.updateYearLevels(program as unknown as Program);
        this.fetchCurriculums((program as unknown as Program).id);
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

  openDialog(columnKey: string, element: Schedule) {
    const dialogConfig: DialogConfig = {
      title: `Select ${this.getColumnLabel(columnKey)}`,
      fields: [
        {
          label: this.getColumnLabel(columnKey),
          formControlName: columnKey,
          type: 'select',
          options: this.getOptionsForColumn(columnKey),
          required: true,
        },
      ],
      isEdit: false,
      initialValue: { [columnKey]: element[columnKey] },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        element[columnKey] = result[columnKey];
        this.cdr.markForCheck();
      }
    });
  }

  getColumnLabel(columnKey: string): string {
    switch (columnKey) {
      case 'day': return 'Day';
      case 'time': return 'Time';
      case 'professor': return 'Professor';
      case 'room': return 'Room';
      default: return '';
    }
  }

  getOptionsForColumn(columnKey: string): string[] {
    switch (columnKey) {
      case 'day': return this.dayOptions;
      case 'time': return this.timeOptions;
      case 'professor': return this.professorOptions;
      case 'room': return this.roomOptions;
      default: return [];
    }
  }
}