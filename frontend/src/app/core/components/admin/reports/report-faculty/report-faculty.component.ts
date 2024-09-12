import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';

import { fadeAnimation } from '../../../../animations/animations';

@Component({
  selector: 'app-report-faculty',
  standalone: true,
  imports: [CommonModule, TableHeaderComponent],
  templateUrl: './report-faculty.component.html',
  styleUrls: ['./report-faculty.component.scss'],
  animations: [fadeAnimation]
})
export class ReportFacultyComponent {
  inputFields: InputField[] = [
    {
      key: 'faculty',
      type: 'select',
      label: 'Faculty',
      options: ['Faculty 1', 'Faculty 2', 'Faculty 3'],
    },
  ];

  activeYear = '2024-2025';
  activeSemester = '1st Semester';

  onActiveYearSemClick() {
    console.log('Active Year & Semester clicked');
  }

  onInputChange(changes: { [key: string]: any }) {
    console.log('Input changed:', changes);
  }
}
