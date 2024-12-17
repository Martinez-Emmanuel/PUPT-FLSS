import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { catchError, of } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { InputField, TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { FacultyService, Faculty } from '../../../../services/superadmin/management/faculty/faculty.service';

import { fadeAnimation } from '../../../../animations/animations';

@Component({
  selector: 'app-faculty',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
  ],
  templateUrl: './faculty.component.html',
  styleUrls: ['./faculty.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyComponent implements OnInit {
  facultyStatuses = ['Active', 'Inactive'];
  facultyTypes = [
    'Full-time (Permanent)',
    'Full-time (Temporary)',
    'Full-time (Designee)',
    'Part-time',
  ];
  selectedFacultyIndex: number | null = null;

  faculty: Faculty[] = [];
  filteredFaculty: Faculty[] = [];
  isLoading = true;

  columns = [
    { key: 'index', label: '#' },
    { key: 'code', label: 'Faculty Code' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'faculty_type', label: 'Type' },
    { key: 'faculty_units', label: 'Units Assigned' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = [
    'index',
    'code',
    'name',
    'email',
    'faculty_type',
    'faculty_units',
    'status',
    'action',
  ];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Faculty',
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

  /**
   * Fetches the list of faculty members from the service.
   * Initializes both faculty and filteredFaculty arrays.
   */
  fetchFaculty() {
    this.isLoading = true;
    this.facultyService
      .getFaculty()
      .pipe(
        catchError((error) => {
          console.error('Error fetching faculty:', error);
          this.snackBar.open(
            'Error fetching faculty. Please try again.',
            'Close',
            { duration: 3000 }
          );
          this.isLoading = false;
          this.cdr.markForCheck();
          return of([]);
        })
      )
      .subscribe((faculty) => {
        this.faculty = faculty.map((user, index) => ({
          id: user.id.toString(),
          code: user.code,
          name: user.name,
          last_name: user.last_name,
          first_name: user.first_name,
          middle_name: user.middle_name,
          suffix_name: user.suffix_name,
          email: user.email || '',
          faculty_type: user.faculty_type || '',
          faculty_units: user.faculty_units ?? 0,
          status: user.status || 'Active',
          role: user.role,
        }));
        this.filteredFaculty = [...this.faculty];
        this.isLoading = false;
        this.cdr.markForCheck();
      });
  }

  /**
   * Handles the search input and filters the faculty accordingly.
   * @param searchTerm The term entered by the user in the search field.
   */
  onSearch(searchTerm: string) {
    if (!searchTerm) {
      this.filteredFaculty = [...this.faculty];
    } else {
      const lowerSearch = searchTerm.toLowerCase();
      this.filteredFaculty = this.faculty.filter(
        (faculty) =>
          faculty.code.toLowerCase().includes(lowerSearch) ||
          faculty.name.toLowerCase().includes(lowerSearch) ||
          faculty.email.toLowerCase().includes(lowerSearch) ||
          faculty.faculty_type.toLowerCase().includes(lowerSearch) ||
          faculty.status.toLowerCase().includes(lowerSearch) ||
          faculty.faculty_units.toString().includes(lowerSearch)
      );
    }
    console.log('Filtered Faculty:', this.filteredFaculty);
    this.cdr.markForCheck();
  }

  /**
   * Configures the dialog for adding or editing faculty.
   * @param faculty Optional Faculty object for editing.
   * @returns DialogConfig object.
   */
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
          disabled: !!faculty,
        },
        {
          label: 'Last Name',
          formControlName: 'last_name',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'First Name',
          formControlName: 'first_name',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'Middle Name',
          formControlName: 'middle_name',
          type: 'text',
          maxLength: 50,
          required: false,
        },
        {
          label: 'Suffix Name',
          formControlName: 'suffix_name',
          type: 'text',
          maxLength: 50,
          required: false,
        },
        {
          label: 'Password',
          formControlName: 'password',
          type: 'text',
          maxLength: 100,
          required: false,
        },
        {
          label: 'Confirm Password',
          formControlName: 'confirmPassword',
          type: 'text',
          maxLength: 100,
          required: false,
          confirmPassword: true,
        },
        {
          label: 'Email',
          formControlName: 'email',
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
          formControlName: 'faculty_units',
          type: 'number',
          required: true,
        },
        {
          label: 'Status',
          formControlName: 'status',
          type: 'select',
          options: this.facultyStatuses,
          required: true,
        },
      ],
      initialValue: faculty || {},
    };
  }

  /**
   * Opens the dialog to add a new faculty member.
   */
  openAddFacultyDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        result.role = 'faculty';
        this.facultyService
          .addFaculty(result)
          .pipe(
            catchError((error) => {
              console.error('Error adding faculty:', error);
              this.snackBar.open(
                'Error adding faculty. Please try again.',
                'Close',
                { duration: 3000 }
              );
              return of(null);
            })
          )
          .subscribe((newFaculty) => {
            if (newFaculty) {
              this.snackBar.open('Faculty added successfully', 'Close', {
                duration: 3000,
              });
              this.fetchFaculty();
            }
          });
      }
    });
  }

  /**
   * Opens the dialog to edit an existing faculty member.
   * @param faculty The faculty member to edit.
   */
  openEditFacultyDialog(faculty: Faculty) {
    this.selectedFacultyIndex = this.faculty.indexOf(faculty);
    const config = this.getDialogConfig(faculty);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedFacultyIndex !== null) {
        this.updateFaculty(result);
      }
    });
  }

  /**
   * Updates an existing faculty member.
   * @param updatedFaculty The updated faculty data.
   */
  updateFaculty(updatedFaculty: Faculty) {
    if (
      this.selectedFacultyIndex !== null &&
      this.selectedFacultyIndex !== undefined
    ) {
      const selectedFaculty = this.faculty[this.selectedFacultyIndex];
      if (selectedFaculty && selectedFaculty.id) {
        const facultyId = selectedFaculty.id;
        updatedFaculty.role = 'faculty';

        // Check if the password field contains the masked value ('********') or is empty.
        // If so, do not include it in the update payload.
        if (
          updatedFaculty.password === '********' ||
          !updatedFaculty.password
        ) {
          delete updatedFaculty.password;
        }

        this.facultyService
          .updateFaculty(facultyId, updatedFaculty)
          .pipe(
            catchError((error) => {
              console.error('Error updating faculty:', error);
              this.snackBar.open(
                'Error updating faculty. Please try again.',
                'Close',
                { duration: 3000 }
              );
              return of(null);
            })
          )
          .subscribe((updatedFacultyResponse) => {
            if (updatedFacultyResponse) {
              this.snackBar.open('Faculty updated successfully', 'Close', {
                duration: 3000,
              });
              this.fetchFaculty();
            }
          });
      }
    }
  }

  /**
   * Deletes a faculty member.
   * @param faculty The faculty member to delete.
   */
  deleteFaculty(faculty: Faculty) {
    const facultyId = faculty.id;

    this.facultyService
      .deleteFaculty(facultyId)
      .pipe(
        catchError((error) => {
          console.error('Error deleting faculty:', error);
          this.snackBar.open(
            'Error deleting faculty. Please try again.',
            'Close',
            { duration: 3000 }
          );
          return of(null);
        })
      )
      .subscribe((result) => {
        if (result !== null) {
          this.faculty = this.faculty.filter((f) => f.id !== facultyId);
          this.filteredFaculty = this.filteredFaculty.filter(
            (f) => f.id !== facultyId
          );
          this.snackBar.open('Faculty deleted successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        }
      });
  }
}
