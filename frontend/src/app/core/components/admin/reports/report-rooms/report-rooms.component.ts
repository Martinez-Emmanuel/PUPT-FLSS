import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import { InputField, TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';

import { fadeAnimation } from '../../../../animations/animations';

@Component({
  selector: 'app-report-rooms',
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
  ],
  templateUrl: './report-rooms.component.html',
  styleUrl: './report-rooms.component.scss',
  animations: [fadeAnimation],
})
export class ReportRoomsComponent {
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Rooms',
      key: 'search',
    },
  ];
  displayedColumns: string[] = [
    'index',
    'roomCode',
    'location',
    'floor',
    'action',
  ];

  // Temporary mock data
  dataSource = [
    {
      roomCode: 'A101',
      location: 'Building A',
      floor: '1st Floor',
    },
    {
      roomCode: 'A202',
      location: 'Building A',
      floor: '2nd Floor',
    },
    {
      roomCode: 'A303',
      location: 'Building A',
      floor: '3rd Floor',
    },
    {
      roomCode: 'A404',
      location: 'Building A',
      floor: '4th Floor',
    },
    {
      roomCode: 'DOST-LAB',
      location: 'Building a',
      floor: '2nd Floor',
    },
  ];

  filteredData = this.dataSource;
  paginator: any;

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
