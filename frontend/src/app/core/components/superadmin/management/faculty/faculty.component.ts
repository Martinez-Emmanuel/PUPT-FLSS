import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import {
  TableDialogComponent,
  DialogConfig,
} from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';
import { FacultyService, Faculty } from '../../../../services/superadmin/management/faculty/faculty.service';
import { catchError, of } from 'rxjs';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FacultyComponent implements OnInit {
  facultyStatuses = ['Active', 'Inactive'];
  facultyTypes = ['Part-Time', 'Full-Time', 'Regular'];
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
        status: user.status || 'Inactive', // Default to 'Inactive' if status is undefined
        role: user.role,
      }));
      this.cdr.markForCheck();
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
          label: 'Status',
          formControlName: 'status',
          type: 'select',
          options: this.facultyStatuses,
          required: true,
        },
      ],
      initialValue: faculty || { status: 'Active' },  // Automatically set status to 'Active'
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
        // Automatically set the role to 'faculty'
        result.role = 'faculty';
  
        this.facultyService.addFaculty(result).pipe(
          catchError((error) => {
            console.error('Error adding faculty:', error);
            return of(null); // Handle error case
          })
        ).subscribe((newFaculty) => {
          if (newFaculty) {
            this.faculty.push(newFaculty); // Assuming the response contains the new faculty
            this.snackBar.open('Faculty added successfully', 'Close', {
              duration: 3000,
            });
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
        this.updateFaculty(result);
      }
    });
  }

  updateFaculty(updatedFaculty: Faculty) {
    if (this.selectedFacultyIndex !== null && this.selectedFacultyIndex !== undefined) {
      const selectedFaculty = this.faculty[this.selectedFacultyIndex];
  
      // Check if the selected faculty is defined
      if (selectedFaculty && selectedFaculty.id) {
        const facultyId = selectedFaculty.id;
  
        // Automatically set the role to 'faculty'
        updatedFaculty.role = 'faculty';
  
        this.facultyService.updateFaculty(facultyId, updatedFaculty).pipe(
          catchError((error) => {
            console.error('Error updating faculty:', error);
            return of(null); // Handle error case
          })
        ).subscribe((updatedFacultyResponse) => {
          if (updatedFacultyResponse) {
            this.faculty[this.selectedFacultyIndex!] = updatedFacultyResponse;
            this.snackBar.open('Faculty updated successfully', 'Close', {
              duration: 3000,
            });
            this.fetchFaculty();
            this.cdr.markForCheck();
          }
        });
      } else {
        console.error('Selected faculty is undefined or missing an id.');
      }
    } else {
      console.error('Selected faculty index is null or undefined.');
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
      this.faculty = this.faculty.filter(f => f.id !== facultyId);
      this.snackBar.open('Faculty deleted successfully', 'Close', {
        duration: 3000,
      });
      this.cdr.markForCheck();
    });
  }
}
