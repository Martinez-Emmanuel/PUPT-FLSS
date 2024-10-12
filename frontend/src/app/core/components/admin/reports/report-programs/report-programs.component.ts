import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';

import {
  InputField,
  TableHeaderComponent,
} from '../../../../../shared/table-header/table-header.component';
import {
  TableDialogComponent,
  DialogConfig,
  DialogFieldConfig,
} from '../../../../../shared/table-dialog/table-dialog.component';

import { fadeAnimation } from '../../../../animations/animations';

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
  ],
  templateUrl: './report-programs.component.html',
  styleUrl: './report-programs.component.scss',
  animations: [fadeAnimation],
})
export class ReportProgramsComponent {
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
  dataSource = [
    {
      programName: 'Bachelor of Science in Information Technology',
      programCode: 'BSIT-TG',
      yearLevel: '1st Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Mechanical Engineering',
      programCode: 'BSME-TG',
      yearLevel: '1st Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Computer Science',
      programCode: 'BSCS-TG',
      yearLevel: '2nd Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Electrical Engineering',
      programCode: 'BSEE-TG',
      yearLevel: '2nd Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Arts in Business Administration',
      programCode: 'BBA-TG',
      yearLevel: '1st Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Civil Engineering',
      programCode: 'BSCE-TG',
      yearLevel: '3rd Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Nursing',
      programCode: 'BSN-TG',
      yearLevel: '1st Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Psychology',
      programCode: 'BSP-TG',
      yearLevel: '2nd Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Hospitality Management',
      programCode: 'BSHM-TG',
      yearLevel: '1st Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Fine Arts',
      programCode: 'BFA-TG',
      yearLevel: '4th Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Marketing',
      programCode: 'BSM-TG',
      yearLevel: '2nd Year',
      section: '1',
    },
    {
      programName: 'Bachelor of Science in Accounting',
      programCode: 'BSAc-TG',
      yearLevel: '4th Year',
      section: '1',
    },
  ];

  filteredData = this.dataSource;
  paginator: any;

  constructor(private dialog: MatDialog) {}

  onOpenDialog(element: any, field: string) {
    let dialogFields: DialogFieldConfig[] = [];
    let title = '';

    if (field === 'yearLevel') {
      dialogFields = [
        {
          label: 'Year Level',
          formControlName: 'yearLevel',
          type: 'select',
          options: ['All', '1', '2', '3', '4'],
          required: true,
        },
      ];
      title = 'Select Year Level';
    } else if (field === 'section') {
      dialogFields = [
        {
          label: 'Section',
          formControlName: 'section',
          type: 'select',
          options: ['All', '1'],
          required: true,
        },
      ];
      title = 'Select Section';
    }

    const dialogConfig: DialogConfig = {
      title,
      fields: dialogFields,
      isEdit: true,
      initialValue: { [field]: element[field] || 'All' },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        element[field] = result[field];
      }
    });
  }

  onExportAll() {
    console.log('Export All clicked');
  }

  onInputChange(event: any) {
    console.log('Input Change:', event);
  }

  onView(element: any) {
    console.log('View clicked:', element);
  }

  onExportSingle(element: any) {
    console.log('Export Single clicked:', element);
  }

  updateDisplayedData() {
    console.log('Page changed');
  }
}
