import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';
import { MatDialog } from '@angular/material/dialog';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';
import { DialogPrefComponent } from '../../../../shared/dialog-pref/dialog-pref.component';
import { DialogExportComponent } from '../../../../shared/dialog-export/dialog-export.component';

import { PreferencesService, ActiveSemester } from '../../../services/faculty/preference/preferences.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable'; 


import { fadeAnimation } from '../../../animations/animations';



interface Faculty {
  faculty_id: number;
  facultyName: string;
  facultyCode: string;
  facultyType: string;
  facultyUnits: number;
  is_enabled: boolean;
  active_semesters?: ActiveSemester[]; 
}

@Component({
  selector: 'app-faculty-pref',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    LoadingComponent,
    DialogPrefComponent,
    DialogExportComponent,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSlideToggleModule,
    MatPaginatorModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatSymbolDirective,
  ],
  templateUrl: './faculty-pref.component.html',
  styleUrls: ['./faculty-pref.component.scss'],
  animations: [fadeAnimation],
})
export class FacultyPrefComponent implements OnInit, AfterViewInit {
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
  allData: Faculty[] = [];
  filteredData: Faculty[] = [];
  isToggleAllChecked = false;
  isLoading = true;
  currentFilter = '';

  @ViewChild(MatPaginator) paginator?: MatPaginator;

  constructor(
    private preferencesService: PreferencesService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadFacultyPreferences();
    this.dataSource.filterPredicate = (data: Faculty, filter: string) => {
      return (
        data.facultyName.toLowerCase().includes(filter) ||
        data.facultyCode.toLowerCase().includes(filter) ||
        data.facultyType.toLowerCase().includes(filter)
      );
    };
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator ?? null;
    this.applyFilter(this.currentFilter);
  }

  loadFacultyPreferences(): void {
    this.isLoading = true;
    this.preferencesService.getPreferences().subscribe(
      (response) => {
        const faculties = response.preferences.map((faculty: any) => ({
          faculty_id: faculty.faculty_id,
          facultyName: faculty.faculty_name,
          facultyCode: faculty.faculty_code,
          facultyType: faculty.faculty_type,
          facultyUnits: faculty.faculty_units,
          is_enabled: faculty.is_enabled === 1,
          active_semesters: faculty.active_semesters // Ensure this is included
        }));

        console.log('Processed Faculty Data:', faculties); // Check if active_semesters exist

        this.allData = faculties;
        this.filteredData = faculties;
        this.applyFilter(this.currentFilter);
        this.checkToggleAllState();
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading faculty preferences:', error);
        this.snackBar.open(
          'Error loading faculty preferences. Please try again.',
          'Close',
          { duration: 3000 }
        );
        this.isLoading = false;
      }
    );
  }

  applyFilter(filterValue: string): void {
    this.currentFilter = filterValue.trim().toLowerCase();

    if (this.currentFilter === '') {
      this.filteredData = [...this.allData];
    } else {
      this.filteredData = this.allData.filter((faculty) =>
        this.filterPredicate(faculty, this.currentFilter)
      );
    }

    if (this.paginator) {
      this.paginator.firstPage();
    }

    this.updateDisplayedData();
  }

  filterPredicate(data: Faculty, filter: string): boolean {
    return (
      data.facultyName.toLowerCase().includes(filter) ||
      data.facultyCode.toLowerCase().includes(filter) ||
      data.facultyType.toLowerCase().includes(filter)
    );
  }

  updateDisplayedData(): void {
    if (this.paginator) {
      const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
      const endIndex = startIndex + this.paginator.pageSize;
      this.dataSource.data = this.filteredData.slice(startIndex, endIndex);
    } else {
      this.dataSource.data = [...this.filteredData];
    }
  }

  checkToggleAllState(): void {
    const allEnabled = this.filteredData.every((faculty) => faculty.is_enabled);
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
        this.filteredData.forEach((faculty) => (faculty.is_enabled = status));
        this.updateDisplayedData();
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

  onInputChange(inputValues: { [key: string]: any }): void {
    const searchValue = inputValues['searchFaculty'] || '';
    this.applyFilter(searchValue);
  }
  onView(faculty: Faculty): void {
    const dialogRef = this.dialog.open(DialogPrefComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: faculty,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Dialog closed', result);
    });
  }

  onExportAll(): void {
    const dialogRef = this.dialog.open(DialogExportComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'faculty Preferences',
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('Export All dialog closed', result);
    });
  }

  onExportSingle(faculty: Faculty): void {
    // Log the faculty data to check the structure
    console.log('Faculty Data:', faculty);
  
    // Check if active semesters and courses are available
    const activeSemester = faculty.active_semesters && faculty.active_semesters.length > 0 
                           ? faculty.active_semesters[0] 
                           : null;
  
    if (!activeSemester) {
      this.snackBar.open(`No active semesters available for ${faculty.facultyName}.`, 'Close', { duration: 3000 });
      return; // Exit if there is no active semester
    }
  
    const courses = activeSemester.courses && activeSemester.courses.length > 0 
                    ? activeSemester.courses 
                    : null;
  
    if (!courses || courses.length === 0) {
      this.snackBar.open(`No courses available for ${faculty.facultyName}.`, 'Close', { duration: 3000 });
      return; // Exit if there are no courses
    }
  
    // Ensure activeSemester is not null before passing its properties
    const academicYear = activeSemester.academic_year || 'N/A';
    const semesterLabel = activeSemester.semester_label || 'N/A';
  
    // Open the export dialog with the faculty and courses data
    const dialogRef = this.dialog.open(DialogExportComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        exportType: 'single',
        entity: 'faculty',
        entityData: {
          ...faculty,
          courses, // Pass the extracted courses
          academicYear, // Use safe variables
          semesterLabel // Use safe variables
        }
      },
      disableClose: true,
    });
  
    dialogRef.afterClosed().subscribe((result) => {
      console.log('Export Single dialog closed', result);
    });
  }
  
  
}
