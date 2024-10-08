import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';

import { fadeAnimation } from '../../../../animations/animations';

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
export class ReportFacultyComponent {
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

  // Temporary mock data
  dataSource = [
    {
      facultyName: 'Emmanuel Martinez',
      facultyCode: 'F0001TG2024',
      facultyType: 'Full-time',
      facultyUnits: 15,
      isEnabled: true,
    },
    {
      facultyName: 'Kyla Malaluan',
      facultyCode: 'F0002TG2024',
      facultyType: 'Part-time',
      facultyUnits: 8,
      isEnabled: false,
    },
    {
      facultyName: 'Adrian Naoe',
      facultyCode: 'F0003TG2024',
      facultyType: 'Full-time',
      facultyUnits: 10,
      isEnabled: true,
    },
    {
      facultyName: 'Via Rasquero',
      facultyCode: 'F0004TG2024',
      facultyType: 'Full-time',
      facultyUnits: 12,
      isEnabled: true,
    },
    {
      facultyName: 'Marissa Ferrer',
      facultyCode: 'F0005TG2024',
      facultyType: 'Part-time (Designee)',
      facultyUnits: 6,
      isEnabled: true,
    },
    {
      facultyName: 'Mhel Garcia',
      facultyCode: 'F0006TG2024',
      facultyType: 'Full-time',
      facultyUnits: 18,
      isEnabled: false,
    },
    {
      facultyName: 'Gecilie Almiranez',
      facultyCode: 'F0007TG2024',
      facultyType: 'Full-time',
      facultyUnits: 14,
      isEnabled: true,
    },
    {
      facultyName: 'Steven Villarosa',
      facultyCode: 'F0008TG2024',
      facultyType: 'Part-time',
      facultyUnits: 5,
      isEnabled: false,
    },
    {
      facultyName: 'John Dustin Santos',
      facultyCode: 'F0009TG2024',
      facultyType: 'Full-time',
      facultyUnits: 20,
      isEnabled: true,
    },
  ];
  

  filteredData = this.dataSource;
  isToggleAllChecked = false;

  paginator: any;

  onActiveYearSemClick() {
    console.log('Active Year & Semester clicked');
  }

  onInputChange(changes: { [key: string]: any }) {
    console.log('Input changed:', changes);
  }

  onView(element: any) {
    console.log('View clicked for:', element);
  }

  onExportAll() {
    console.log('Export All clicked');
  }

  onExportSingle(element: any) {
    console.log('Export clicked for:', element);
  }

  onToggleChange(element: any) {
    console.log('Toggle changed for:', element);
  }

  onToggleAllChange(event: any) {
    console.log('Toggle All changed:', event);
    
    this.isToggleAllChecked = event.checked;
    this.dataSource.forEach(
      (faculty) => (faculty.isEnabled = this.isToggleAllChecked)
    );
  }

  updateDisplayedData() {
    console.log('Paginator updated');
  }
}
