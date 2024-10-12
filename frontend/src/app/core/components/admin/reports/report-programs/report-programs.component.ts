import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar'; 

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig, DialogFieldConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { ReportsService } from '../../../../services/admin/reports/reports.service';

import { fadeAnimation } from '../../../../animations/animations';

interface CourseDetails {
  course_assignment_id: number;
  course_title: string;
  course_code: string;
  lec: number;
  lab: number;
  units: number;
  tuition_hours: number;
}

interface Schedule {
  schedule_id: number;
  day: string;
  start_time: string;
  end_time: string;
  faculty_name: string;
  faculty_code: string;
  room_code: string;
  course_details: CourseDetails;
}

interface Section {
  section_name: string;
  schedules: Schedule[];
}

interface YearLevel {
  year_level: number;
  sections: Section[];
}

interface Program {
  program_id: number;
  program_code: string;
  program_title: string;
  year_levels: YearLevel[];
  year_levels_selected?: string;
  section_selected?: string;
}

@Component({
  selector: 'app-report-programs',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatTooltipModule,
    TableHeaderComponent,
    TableDialogComponent,
    LoadingComponent,
  ],
  templateUrl: './report-programs.component.html',
  styleUrls: ['./report-programs.component.scss'],
  animations: [fadeAnimation],
})
export class ReportProgramsComponent implements OnInit {
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Programs',
      key: 'search',
    },
  ];

  displayedColumns: string[] = [
    'index',
    'programCode',
    'programName',
    'yearLevel',
    'section',
    'action',
  ];

  dataSource = new MatTableDataSource<Program>();
  filteredData: Program[] = [];
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private reportsService: ReportsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.fetchProgramsData();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  fetchProgramsData(): void {
    this.isLoading = true;
    this.reportsService.getProgramSchedulesReport().subscribe({
      next: (response) => {
        const programData: Program[] =
          response.programs_schedule_reports.programs.map((program: any) => ({
            program_id: program.program_id,
            program_code: program.program_code,
            program_title: program.program_title,
            year_levels: program.year_levels.map((yl: any) => ({
              year_level: yl.year_level,
              sections: yl.sections.map((sec: any) => ({
                section_name: sec.section_name,
                schedules: sec.schedules,
              })),
            })),
            year_levels_selected: 'All',
            section_selected: 'All',
          }));

        this.isLoading = false;
        this.dataSource.data = programData;
        this.filteredData = [...programData];
        this.dataSource.paginator = this.paginator;
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error fetching programs data:', error);
        this.snackBar.open(
          'Failed to load programs data. Please try again later.',
          'Close',
          {
            duration: 5000,
          }
        );
      },
    });
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
        (program) =>
          program.program_code.toLowerCase().includes(searchQuery) ||
          program.program_title.toLowerCase().includes(searchQuery)
      );
    }
  }

  onExportAll() {
    console.log('Export All clicked');
  }

  onView(element: Program) {
    console.log('View Schedule clicked');
  }

  onExportSingle(element: Program) {
    console.log('Export Single clicked for:', element);
  }

  onOpenDialog(program: Program, field: 'yearLevel' | 'section') {
    let dialogFields: DialogFieldConfig[] = [];
    let title = '';
    let options: string[] = [];

    if (field === 'yearLevel') {
      // Extract unique year levels from the program
      const uniqueYearLevels = program.year_levels.map((yl) => yl.year_level);
      options = ['All', ...uniqueYearLevels.map(String)];
      dialogFields = [
        {
          label: 'Year Level',
          formControlName: 'yearLevel',
          type: 'select',
          options: options,
          required: true,
        },
      ];
      title = 'Select Year Level';
    } else if (field === 'section') {
      if (program.year_levels_selected === 'All') {
        // Get all unique sections across all year levels
        const uniqueSections = Array.from(
          new Set(
            program.year_levels.flatMap((yl) =>
              yl.sections.map((sec) => sec.section_name)
            )
          )
        );
        options = ['All', ...uniqueSections];
      } else {
        // Find the selected year level
        const selectedYearLevel = program.year_levels.find(
          (yl) => yl.year_level.toString() === program.year_levels_selected
        );
        if (selectedYearLevel) {
          const sections = selectedYearLevel.sections.map(
            (sec) => sec.section_name
          );
          options = ['All', ...sections];
        } else {
          // Fallback in case no matching year level is found
          options = ['All'];
        }
      }

      dialogFields = [
        {
          label: 'Section',
          formControlName: 'section',
          type: 'select',
          options: options,
          required: true,
        },
      ];
      title = 'Select Section';
    }

    const dialogConfig: DialogConfig = {
      title,
      fields: dialogFields,
      isEdit: true,
      initialValue: {
        [field === 'yearLevel' ? 'yearLevel' : 'section']:
          field === 'yearLevel'
            ? program.year_levels_selected
            : program.section_selected,
      },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (field === 'yearLevel') {
          program.year_levels_selected = result.yearLevel;
          program.section_selected = 'All';
        } else if (field === 'section') {
          program.section_selected = result.section;
        }
        // Further logic can be implemented based on the selection
      }
    });
  }

  updateDisplayedData() {
    console.log('Page changed');
  }
}
