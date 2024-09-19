import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { catchError, of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { InputField, TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';

import { FacultyService, Faculty } from '../../../../services/superadmin/management/faculty/faculty.service';

import { fadeAnimation } from '../../../../animations/animations';


@Component({
  selector: 'app-faculty',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
  ],
  templateUrl: './faculty.component.html',
  styleUrls: ['./faculty.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyComponent implements OnInit {
  facultyStatuses = ['active', 'inactive'];
  facultyTypes = ['part-time', 'full-time', 'regular'];
  selectedFacultyIndex: number | null = null;

  faculty: Faculty[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'code', label: 'Faculty Code' },
    { key: 'name', label: 'Name' },
    { key: 'faculty_email', label: 'Email' },
    { key: 'faculty_type', label: 'Type' },
    { key: 'faculty_unit', label: 'Units Assigned' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = ['index', 'code', 'name', 'faculty_email', 'faculty_type', 'faculty_unit', 'status', 'action'];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Curriculum',
      key: 'search',
    },
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private facultyService: FacultyService
  ) {}

  ngOnInit() {
    this.fetchFaculty();
  }

  fetchFaculty() {
    this.facultyService.getFaculty().pipe(
      catchError((error) => {
        console.error('Error fetching faculty:', error);
        return of([]); // Return empty array on error
      })
    ).subscribe((faculty) => {
      this.faculty = faculty.map((user, index) => ({
        id: user.id,
        code: user.code,
        name: user.name,
        faculty_email: user.faculty_email || '',
        faculty_type: user.faculty_type || '',
        faculty_unit: user.faculty_unit || 0,
        status: user.status || 'Active', // Default to 'Active' if status is undefined
        role: user.role,
      }));
      this.cdr.markForCheck(); // Make sure Angular detects changes
    });
  }

  onSearch(searchTerm: string) {
    this.facultyService.getFaculty().pipe(
      catchError((error) => {
        console.error('Error fetching faculty for search:', error);
        return of([]); // Return empty array on error
      })
    ).subscribe((faculty) => {
      this.faculty = faculty.filter(
        (facultyMember) =>
          facultyMember.code.includes(searchTerm) ||
          facultyMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facultyMember.faculty_type.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.cdr.markForCheck();
    });
  }

  private getDialogConfig(faculty?: Faculty): DialogConfig {    
    return {
      title: 'Faculty',
      isEdit: !!faculty,
      fields: [
        {
          label: 'Faculty Code',
          formControlName: 'code',
          type: 'text',
          maxLength: 12,
          required: true,
          disabled: !!faculty,  // Disable when editing
        },
        {
          label: 'Name',
          formControlName: 'name',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'Password',
          formControlName: 'password',
          type: 'text',
          maxLength: 100,
          required: false,
        },
        {
          label: 'Email',
          formControlName: 'faculty_email',
          type: 'text',
          maxLength: 100,
          required: true,
        },
        {
          label: 'Type',
          formControlName: 'faculty_type',
          type: 'select',
          options: this.facultyTypes,
          required: true,
        },
        {
          label: 'Units Assigned',
          formControlName: 'faculty_unit',
          type: 'number',
          required: true,
        },
        {
          label: 'Status',  // Status is now required in both add and edit
          formControlName: 'status',
          type: 'select',
          options: this.facultyStatuses,
          required: true,  // Make status required
        },
      ],
      initialValue: faculty || {},  // No default status, user must pick
    };
  }

  openAddFacultyDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.role = 'faculty';  // Ensure the role is 'faculty'
        this.facultyService.addFaculty(result).pipe(
          catchError((error) => {
            console.error('Error adding faculty:', error);
            return of(null); // Handle error case
          })
        ).subscribe((newFaculty) => {
          if (newFaculty) {
            this.faculty.push(newFaculty);  // Add new faculty to the list
            this.snackBar.open('Faculty added successfully', 'Close', { duration: 3000 });
            this.fetchFaculty();  // Refresh the data after addition
            this.cdr.markForCheck();
          }
        });
      }
    });
  }

  openEditFacultyDialog(faculty: Faculty) {
    this.selectedFacultyIndex = this.faculty.indexOf(faculty);
    const config = this.getDialogConfig(faculty);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedFacultyIndex !== null) {
        this.updateFaculty(result);  // Call the update method
      }
    });
  }

  updateFaculty(updatedFaculty: Faculty) {
    if (this.selectedFacultyIndex !== null && this.selectedFacultyIndex !== undefined) {
      const selectedFaculty = this.faculty[this.selectedFacultyIndex];

      if (selectedFaculty && selectedFaculty.id) {
        const facultyId = selectedFaculty.id;
        updatedFaculty.role = 'faculty';  // Ensure role is 'faculty'

        // Check if the password field contains the masked value ('********') or is empty.
        // If so, do not include it in the update payload.
        if (updatedFaculty.password === '********' || !updatedFaculty.password) {
          delete updatedFaculty.password;
        }

        this.facultyService.updateFaculty(facultyId, updatedFaculty).pipe(
          catchError((error) => {
            console.error('Error updating faculty:', error);
            return of(null);
          })
        ).subscribe((updatedFacultyResponse) => {
          if (updatedFacultyResponse) {
            this.faculty[this.selectedFacultyIndex!] = updatedFacultyResponse;
            this.snackBar.open('Faculty updated successfully', 'Close', { duration: 3000 });
            this.fetchFaculty();  // Refresh the data after update
            this.cdr.markForCheck();
          }
        });
      }
    }
  }

  deleteFaculty(faculty: Faculty) {
    const facultyId = faculty.id;

    this.facultyService.deleteFaculty(facultyId).pipe(
      catchError((error) => {
        console.error('Error deleting faculty:', error);
        return of(null); // Handle error case
      })
    ).subscribe(() => {
      this.faculty = this.faculty.filter(f => f.id !== facultyId);  // Remove from the list
      this.snackBar.open('Faculty deleted successfully', 'Close', { duration: 3000 });
      this.cdr.markForCheck();
    });
  }
}
