import { Component } from '@angular/core';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSlideToggle, MatSlideToggleChange  } from '@angular/material/slide-toggle';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import {
  TableHeaderComponent,
  InputField,
} from '../../../../shared/table-header/table-header.component';
import { fadeAnimation } from '../../../animations/animations';

interface Faculty {
  index: number;
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  action: string;
  is_enabled: boolean;
}

@Component({
  selector: 'app-faculty-pref',
  standalone: true,
  imports: [
    TableHeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggle,
    MatPaginatorModule,
  ],
  templateUrl: './faculty-pref.component.html',
  styleUrls: ['./faculty-pref.component.scss'],
  animations: [fadeAnimation],
})
export class FacultyPrefComponent {
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Faculty',
      key: 'searchFaculty',
    },
  ];

  // Table Data Source
  faculties: Faculty[] = [
    {
      index: 1,
      facultyName: 'John Doe',
      facultyCode: 'F001',
      facultyType: 'Full-Time',
      facultyUnits: 12,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 2,
      facultyName: 'Jane Smith',
      facultyCode: 'F002',
      facultyType: 'Part-Time',
      facultyUnits: 6,
      action: 'Edit',
      is_enabled: false,
    },
    {
      index: 3,
      facultyName: 'Alice Johnson',
      facultyCode: 'F003',
      facultyType: 'Full-Time',
      facultyUnits: 10,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 4,
      facultyName: 'Bob Brown',
      facultyCode: 'F004',
      facultyType: 'Part-Time',
      facultyUnits: 4,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 5,
      facultyName: 'Charlie Davis',
      facultyCode: 'F005',
      facultyType: 'Full-Time',
      facultyUnits: 15,
      action: 'Edit',
      is_enabled: false,
    },
    {
      index: 6,
      facultyName: 'Diana Evans',
      facultyCode: 'F006',
      facultyType: 'Part-Time',
      facultyUnits: 8,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 7,
      facultyName: 'Edward Green',
      facultyCode: 'F007',
      facultyType: 'Full-Time',
      facultyUnits: 12,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 8,
      facultyName: 'Fiona Harris',
      facultyCode: 'F008',
      facultyType: 'Part-Time',
      facultyUnits: 5,
      action: 'Edit',
      is_enabled: false,
    },
    {
      index: 9,
      facultyName: 'George King',
      facultyCode: 'F009',
      facultyType: 'Full-Time',
      facultyUnits: 14,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 10,
      facultyName: 'Hannah Lee',
      facultyCode: 'F010',
      facultyType: 'Part-Time',
      facultyUnits: 7,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 11,
      facultyName: 'Ian Miller',
      facultyCode: 'F011',
      facultyType: 'Full-Time',
      facultyUnits: 13,
      action: 'Edit',
      is_enabled: false,
    },
    {
      index: 12,
      facultyName: 'Jasmine Nelson',
      facultyCode: 'F012',
      facultyType: 'Part-Time',
      facultyUnits: 6,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 13,
      facultyName: 'Kevin Ortiz',
      facultyCode: 'F013',
      facultyType: 'Full-Time',
      facultyUnits: 11,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 14,
      facultyName: 'Laura Perez',
      facultyCode: 'F014',
      facultyType: 'Part-Time',
      facultyUnits: 9,
      action: 'Edit',
      is_enabled: false,
    },
    {
      index: 15,
      facultyName: 'Michael Quintero',
      facultyCode: 'F015',
      facultyType: 'Full-Time',
      facultyUnits: 16,
      action: 'Edit',
      is_enabled: true,
    },
    {
      index: 16,
      facultyName: 'Nina Roberts',
      facultyCode: 'F016',
      facultyType: 'Part-Time',
      facultyUnits: 4,
      action: 'Edit',
      is_enabled: true,
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
  dataSource = new MatTableDataSource<Faculty>(this.faculties);

  onExport(): void {
    console.log('Export to PDF triggered');
  }

  onInputChange(inputValues: { [key: string]: any }): void {
    console.log('Input values changed:', inputValues);
  }
  onView(faculty: Faculty): void {
    console.log('View clicked for:', faculty);
  }

  onPrint(faculty: Faculty): void {
    console.log('Print clicked for:', faculty);
  }

  onToggleChange(faculty: Faculty): void {
    faculty.is_enabled = !faculty.is_enabled;
    console.log('Toggled: ', faculty);
  }

  onToggleAllChange(event: MatSlideToggleChange): void {
    console.log('All toggled to:');
  }

}
