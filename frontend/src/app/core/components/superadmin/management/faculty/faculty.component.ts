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

import {
  FacultyService,
  Faculty,
} from '../../../../services/superadmin/management/faculty/faculty.service';

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
    { key: 'facultyId', label: 'Faculty Code' },
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'type', label: 'Type' }, // Part-Time, Full-Time, Regular
    { key: 'unitsAssigned', label: 'Units Assigned' },
    { key: 'status', label: 'Status' }, 
  ];

  displayedColumns: string[] = ['index', 'facultyId', 'name', 'email', 'type', 'unitsAssigned', 'status', 'action'];

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
    this.facultyService.getFaculty().subscribe((faculty) => {
      this.faculty = faculty;
      this.cdr.markForCheck();
    });
  }

  onSearch(searchTerm: string) {
    this.facultyService.getFaculty().subscribe((faculty) => {
      this.faculty = faculty.filter(
        (facultyMember) =>
          facultyMember.facultyId.includes(searchTerm) ||
          facultyMember.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          facultyMember.type.toLowerCase().includes(searchTerm.toLowerCase()) 
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
          formControlName: 'facultyId',
          type: 'text',
          maxLength: 12,
          required: true,
          disabled:!!faculty,
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
          formControlName: 'email',
          type: 'text',
          maxLength: 100,
          required: true,
        },
        {
          label: 'Type',
          formControlName: 'type',
          type: 'select',
          options: this.facultyTypes,
          required: true,
        },
        {
          label: 'Units Assigned',
          formControlName: 'unitsAssigned',
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
      initialValue: faculty || { status: 'Active' },
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
        this.facultyService.addFaculty(result).subscribe((faculty) => {
          this.faculty = faculty;
          this.snackBar.open('Faculty added successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
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

  updateFaculty(updatedFaculty: any) {
    if (this.selectedFacultyIndex !== null) {
      this.faculty[this.selectedFacultyIndex] = {
        ...this.faculty[this.selectedFacultyIndex],
        ...updatedFaculty,
      };

      this.facultyService
        .updateFaculty(this.selectedFacultyIndex, updatedFaculty)
        .subscribe((faculty) => {
          this.faculty = faculty;
          this.snackBar.open('Faculty updated successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        });
    }
  }

  deleteFaculty(faculty: Faculty) {
    const index = this.faculty.indexOf(faculty);
    if (index >= 0) {
      this.facultyService.deleteFaculty(index).subscribe((faculty) => {
        this.faculty = faculty;
        this.snackBar.open('Faculty deleted successfully', 'Close', {
          duration: 3000,
        });
        this.cdr.markForCheck();
      });
    }
  }
}