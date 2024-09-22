import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';



import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';

import { fadeAnimation } from '../../../../animations/animations';

@Component({
  selector: 'app-report-rooms',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
  ],
  templateUrl: './report-rooms.component.html',
  styleUrls: ['./report-rooms.component.scss'],
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

    // Active year and semester information
    activeYear = '2024-2025';
    activeSemester = '1st Semester';
}
