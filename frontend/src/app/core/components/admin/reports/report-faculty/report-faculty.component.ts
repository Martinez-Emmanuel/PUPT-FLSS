import { Component, OnInit, ViewChild, AfterViewInit, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogViewScheduleComponent } from '../../../../../shared/dialog-view-schedule/dialog-view-schedule.component';

import { ReportsService } from '../../../../services/admin/reports/reports.service';

import { fadeAnimation } from '../../../../animations/animations';

interface Faculty {
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  isEnabled: boolean;
  facultyId: number;
  schedules?: any[];
  academicYear?: string;
  semester?: string;
}

@Component({
  selector: 'app-report-faculty',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
    MatDialogModule,
    MatSymbolDirective,
  ],
  templateUrl: './report-faculty.component.html',
  styleUrl: './report-faculty.component.scss',
  animations: [fadeAnimation],
})
export class ReportFacultyComponent
  implements OnInit, AfterViewInit, AfterViewChecked
{
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Faculty',
      key: 'search',
    },
  ];

  displayedColumns: string[] = [
    'index',
    'facultyName',
    'facultyCode',
    'facultyType',
    'facultyUnits',
    'action',
    'toggle',
  ];

  dataSource = new MatTableDataSource<Faculty>();
  filteredData: Faculty[] = [];
  hasSchedulesForToggleAll = false;
  isToggleAllChecked = false;
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private reportsService: ReportsService,
    public dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchFacultyData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngAfterViewChecked() {
    if (this.dataSource.paginator !== this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  fetchFacultyData(): void {
    this.isLoading = true;
    this.reportsService.getFacultySchedulesReport().subscribe({
      next: (response) => {
        const facultyData = response.faculty_schedule_reports.faculties.map(
          (faculty: any) => ({
            facultyName: faculty.faculty_name,
            facultyCode: faculty.faculty_code,
            facultyType: faculty.faculty_type,
            facultyUnits: faculty.assigned_units,
            isEnabled: faculty.is_published === 1,
            facultyId: faculty.faculty_id,
            schedules: faculty.schedules || [],
            academicYear: `${response.faculty_schedule_reports.year_start}-${response.faculty_schedule_reports.year_end}`,
            semester: this.getSemesterDisplay(
              response.faculty_schedule_reports.semester
            ),
          })
        );

        this.isLoading = false;
        this.dataSource.data = facultyData;
        this.filteredData = [...facultyData];
        this.dataSource.paginator = this.paginator;

        this.hasSchedulesForToggleAll = facultyData.some(
          (faculty: { schedules: string | any[] }) =>
            faculty.schedules && faculty.schedules.length > 0
        );

        this.isToggleAllChecked =
          this.dataSource.data.length > 0 &&
          this.dataSource.data.every((faculty) => faculty.isEnabled);
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching faculty data:', error);
      },
    });
  }

  getSemesterDisplay(semester: number): string {
    switch (semester) {
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

  getRowIndex(index: number): number {
    if (this.paginator) {
      return index + 1 + this.paginator.pageIndex * this.paginator.pageSize;
    }
    return index + 1;
  }

  onInputChange(changes: { [key: string]: any }) {
    const searchQuery = changes['search']
      ? changes['search'].trim().toLowerCase()
      : '';

    if (searchQuery === '') {
      this.dataSource.data = this.filteredData;
    } else {
      this.dataSource.data = this.filteredData.filter(
        (faculty) =>
          faculty.facultyName.toLowerCase().includes(searchQuery) ||
          faculty.facultyCode.toLowerCase().includes(searchQuery) ||
          faculty.facultyType.toLowerCase().includes(searchQuery)
      );
    }

    this.isToggleAllChecked =
      this.dataSource.data.length > 0 &&
      this.dataSource.data.every((faculty) => faculty.isEnabled);
  }

  onView(element: any) {
    this.dialog.open(DialogViewScheduleComponent, {
      maxWidth: '90vw',
      width: '100%',
      data: {
        exportType: 'single',
        entity: 'faculty',
        entityData: element.schedules,
        customTitle: `${element.facultyName}`,
        academicYear: element.academicYear,
        semester: element.semester,
      },
      disableClose: true,
    });
  }

  onExportAll() {
    console.log('Export All clicked');
  }

  onExportSingle(element: Faculty) {
    console.log('Export clicked for:', element);
  }

  onToggleAllChange(event: any) {
    const isPublished = event.checked ? 1 : 0;

    this.snackBar.open('Loading, please wait...', 'Close', {
      duration: undefined,
    });

    this.reportsService.togglePublishAllSchedules(isPublished).subscribe({
      next: (response) => {
        this.dataSource.data.forEach((faculty) => {
          if (faculty.schedules && faculty.schedules.length > 0) {
            faculty.isEnabled = isPublished === 1;
          }
        });

        this.isToggleAllChecked =
          this.dataSource.data.length > 0 &&
          this.dataSource.data
            .filter(
              (faculty) => faculty.schedules && faculty.schedules.length > 0
            )
            .every((faculty) => faculty.isEnabled);

        this.snackBar.open(
          'Schedules successfully published for all applicable faculty.',
          'Close',
          {
            duration: 3000,
          }
        );
      },
      error: (error) => {
        console.error('Error toggling all schedules:', error);
        this.isToggleAllChecked = !event.checked;

        this.snackBar.open(
          'Error publishing schedules for all applicable faculty.',
          'Close',
          {
            duration: 3000,
          }
        );
      },
    });
  }

  onToggleChange(element: Faculty) {
    const isPublished = element.isEnabled ? 1 : 0;

    this.snackBar.open('Loading, please wait...', 'Close', {
      duration: undefined,
    });

    this.reportsService
      .togglePublishSingleSchedule(element.facultyId, isPublished)
      .subscribe({
        next: (response) => {
          this.isToggleAllChecked =
            this.dataSource.data.length > 0 &&
            this.dataSource.data.every((faculty) => faculty.isEnabled);

          this.snackBar.open(
            `Schedules successfully published for ${element.facultyName}.`,
            'Close',
            {
              duration: 3000,
            }
          );
        },
        error: (error) => {
          console.error(
            `Error toggling schedule for faculty ${element.facultyId}:`,
            error
          );
          element.isEnabled = !element.isEnabled;

          this.snackBar.open(
            `Error publishing schedules for ${element.facultyName}.`,
            'Close',
            {
              duration: 3000,
            }
          );
        },
      });
  }

  updateDisplayedData() {
    console.log('Paginator updated');
  }
}
