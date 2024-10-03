import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';

import { PreferencesService } from '../../../services/faculty/preference/preferences.service';

import { fadeAnimation } from '../../../animations/animations';

interface Faculty {
  faculty_id: number;
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  is_enabled: boolean;
}

@Component({
  selector: 'app-faculty-pref',
  standalone: true,
  imports: [
    TableHeaderComponent,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './faculty-pref.component.html',
  styleUrls: ['./faculty-pref.component.scss'],
  animations: [fadeAnimation],
})
export class FacultyPrefComponent implements OnInit {
  inputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Faculty',
      key: 'searchFaculty',
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

  dataSource = new MatTableDataSource<Faculty>([]);
  isToggleAllChecked = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private preferencesService: PreferencesService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadFacultyPreferences();
  }

  loadFacultyPreferences(): void {
    this.preferencesService.getPreferences().subscribe((response) => {
      const faculties = response.preferences.map((faculty: any) => ({
        faculty_id: faculty.faculty_id,
        facultyName: faculty.faculty_name,
        facultyCode: faculty.faculty_code,
        facultyType: faculty.faculty_type,
        facultyUnits: faculty.faculty_units,
        is_enabled: faculty.is_enabled === 1,
      }));

      this.dataSource.data = faculties;
      this.dataSource.paginator = this.paginator;
      this.checkToggleAllState();
    });
  }

  checkToggleAllState(): void {
    const allEnabled = this.dataSource.data.every(
      (faculty) => faculty.is_enabled
    );
    this.isToggleAllChecked = allEnabled;
  }

  onToggleChange(faculty: Faculty): void {
    const status = faculty.is_enabled;

    this.preferencesService
      .toggleFacultyPreferences(faculty.faculty_id, status)
      .subscribe(
        (response) => {
          this.snackBar.open(
            `Preferences submission ${
              status ? 'enabled' : 'disabled'
            } for Prof. ${faculty.facultyName}.`,
            'Close',
            { duration: 3000 }
          );
          this.checkToggleAllState();
        },
        (error) => {
          this.snackBar.open(
            `Failed to update preference for ${faculty.facultyName}`,
            'Close',
            { duration: 3000 }
          );
          console.error('Error updating faculty preference:', error);
        }
      );
  }

  onToggleAllChange(event: MatSlideToggleChange): void {
    const status = event.checked;

    const loadingSnackBarRef = this.snackBar.open(
      'Loading, please wait...',
      'Close',
      {
        duration: undefined,
      }
    );

    this.preferencesService.toggleAllFacultyPreferences(status).subscribe(
      (response) => {
        this.dataSource.data.forEach(
          (faculty) => (faculty.is_enabled = status)
        );
        loadingSnackBarRef.dismiss();

        this.snackBar.open(
          `Preferences submission for all faculty is ${
            status ? 'enabled' : 'disabled'
          }.`,
          'Close',
          { duration: 3000 }
        );

        this.isToggleAllChecked = status;
      },
      (error) => {
        loadingSnackBarRef.dismiss();

        this.snackBar.open(
          'Failed to update preferences for all faculty',
          'Close',
          { duration: 3000 }
        );
        console.error('Error updating all preferences:', error);
      }
    );
  }

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
}
