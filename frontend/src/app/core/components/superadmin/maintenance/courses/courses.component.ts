import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Course {
  course_code: string;
  course_title: string;
  lec_hours: number;
  lab_hours: number;
  total_units: number;
  tuition_hours: number;
}

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [
    CommonModule,
    MatSymbolDirective,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatSelectModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoursesComponent implements OnInit {
  @ViewChild('addEditCourseDialog') addEditCourseDialog!: TemplateRef<any>;

  displayedColumns: string[] = [
    'num',
    'course_code',
    'course_title',
    'lec_hours',
    'lab_hours',
    'total_units',
    'tuition_hours',
    'action',
  ];

  dataSource = new MatTableDataSource<Course>([]);
  addCourseForm!: FormGroup;
  isEdit = false;
  selectedCourse: Course | null = null;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadCourses();
  }

  initializeForm(): void {
    this.addCourseForm = this.fb.group({
      course_code: ['', Validators.required],
      course_title: ['', Validators.required],
      lec_hours: [0, Validators.required],
      lab_hours: [0, Validators.required],
      total_units: [0, Validators.required],
      tuition_hours: [0, Validators.required],
    });
  }

  loadCourses(): void {
    const courses: Course[] = [
      {
        course_code: 'COMP 20013',
        course_title: 'Introduction to Computing',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20063',
        course_title: 'Data Structures and Algorithms',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20213',
        course_title: 'Database Administration',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20163',
        course_title: 'Web Development',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 2633',
        course_title: 'Technopreneurship',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20203',
        course_title: 'Quantitative Methods with Modeling and Simulation',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20193',
        course_title: 'Network Administration',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20143',
        course_title: 'Human Computer Interaction',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20083',
        course_title: 'Object Oriented Programming',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
      {
        course_code: 'COMP 20133',
        course_title: 'Applications Development and Emerging Technologies',
        lec_hours: 3,
        lab_hours: 1,
        total_units: 4,
        tuition_hours: 4,
      },
    ];

    this.dataSource.data = courses;
  }

  openAddCourseDialog(): void {
    this.isEdit = false;
    this.addCourseForm.reset();
    this.dialog.open(this.addEditCourseDialog, {
      width: '250px',
    });
  }

  openEditCourseDialog(course: Course): void {
    this.isEdit = true;
    this.selectedCourse = course;
    this.addCourseForm.patchValue(course);
    this.dialog.open(this.addEditCourseDialog, {
      width: '250px',
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  addCourse(): void {
    if (this.addCourseForm.valid) {
      const newCourse: Course = this.addCourseForm.value;
      // Add new course to the data source
      this.dataSource.data = [...this.dataSource.data, newCourse];
      this.closeDialog();
      this.snackBar.open('Course added successfully', 'Close', {
        duration: 2000,
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 2000,
      });
    }
  }

  updateCourse(): void {
    if (this.addCourseForm.valid && this.selectedCourse) {
      const updatedCourse: Course = this.addCourseForm.value;
      const index = this.dataSource.data.indexOf(this.selectedCourse);
      if (index > -1) {
        this.dataSource.data[index] = updatedCourse;
        this.dataSource.data = [...this.dataSource.data];
        this.closeDialog();
        this.snackBar.open('Course updated successfully', 'Close', {
          duration: 2000,
        });
      }
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 2000,
      });
    }
  }

  deleteCourse(course: Course): void {
    const index = this.dataSource.data.indexOf(course);
    if (index > -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      this.snackBar.open('Course deleted successfully', 'Close', {
        duration: 2000,
      });
    }
  }
}
