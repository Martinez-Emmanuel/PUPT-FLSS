import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';

import { ReportsService } from '../../../../services/admin/reports/reports.service';

import { fadeAnimation } from '../../../../animations/animations';

interface Faculty {
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  isEnabled: boolean;
  facultyId: number;
}

@Component({
  selector: 'app-report-faculty',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatTooltipModule,
    FormsModule,
  ],
  templateUrl: './report-faculty.component.html',
  styleUrl: './report-faculty.component.scss',
  animations: [fadeAnimation],
})
export class ReportFacultyComponent implements OnInit {
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
  isToggleAllChecked = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private reportsService: ReportsService) {}

  ngOnInit(): void {
    this.fetchFacultyData();
  }

  fetchFacultyData(): void {
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
          })
        );

        this.dataSource.data = facultyData;
        this.filteredData = [...facultyData];
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        console.error('Error fetching faculty data:', error);
      },
    });
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
  }

  onView(element: Faculty) {
    console.log('View clicked for:', element);
  }

  onExportAll() {
    console.log('Export All clicked');
  }

  onExportSingle(element: Faculty) {
    console.log('Export clicked for:', element);
  }

  onToggleChange(element: Faculty) {
    console.log('Toggle changed for:', element);
  }

  onToggleAllChange(event: any) {
    this.isToggleAllChecked = event.checked;
  }

  updateDisplayedData() {
    console.log('Paginator updated');
  }
}
