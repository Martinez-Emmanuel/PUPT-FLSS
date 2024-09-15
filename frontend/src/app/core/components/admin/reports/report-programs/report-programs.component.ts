import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';

import { fadeAnimation } from '../../../../animations/animations';

@Component({
  selector: 'app-report-programs',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    TableHeaderComponent,
  ],
  templateUrl: './report-programs.component.html',
  styleUrls: ['./report-programs.component.scss'],
  animations: [fadeAnimation],
})
export class ReportProgramsComponent {
  inputFields: InputField[] = [
    {
      type: 'select',
      label: 'Program',
      key: 'program',
      options: ['Program A', 'Program B', 'Program C'],
    },
    {
      type: 'select',
      label: 'Year Level',
      key: 'yearLevel',
      options: ['1', '2', '3', '4'],
    },
    {
      type: 'select',
      label: 'Section',
      key: 'section',
      options: ['Section A', 'Section B', 'Section C'],
    },
  ];

  activeYear = '2024-2025';
  activeSemester = '1st Semester';
}
