import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent } from '../../../../../../shared/dialog-generic/dialog-generic.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../../../animations/animations';

import { CurriculumService, Curriculum, Program, YearLevel, Semester, Course } from '../../../../../services/superadmin/curriculum/curriculum.service';

@Component({
  selector: 'app-curriculum-detail',
  standalone: true,
  imports: [
    CommonModule,
    TableGenericComponent,
    TableHeaderComponent,
    DialogGenericComponent,
  ],
  templateUrl: './curriculum-detail.component.html',
  styleUrls: ['./curriculum-detail.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class CurriculumDetailComponent implements OnInit {
  @ViewChild(TableHeaderComponent) tableHeaderComponent!: TableHeaderComponent;
  public curriculum: Curriculum | undefined;
  public selectedProgram: string = '';
  public selectedYear: number = 1;
  public selectedSections: number = 1;
  public selectedSemesters: Semester[] = [];
  public customExportOptions: { all: string; current: string } | null = null;
  private destroy$ = new Subject<void>();

  headerInputFields: InputField[] = [
    {
      type: 'select',
      label: 'Program',
      key: 'program',
      options: [],
    },
    {
      type: 'select',
      label: 'Year Level',
      key: 'yearLevel',
      options: [],
    },
  ];

  columns = [
    { key: 'index', label: '#' },
    { key: 'course_code', label: 'Course Code' },
    { key: 'pre_req', label: 'Pre-req' },
    { key: 'co_req', label: 'Co-req' },
    { key: 'course_title', label: 'Course Title' },
    { key: 'lec_hours', label: 'Lec Hours' },
    { key: 'lab_hours', label: 'Lab Hours' },
    { key: 'units', label: 'Units' },
    { key: 'tuition_hours', label: 'Tuition Hours' },
  ];

  displayedColumns: string[] = [
    'index',
    'course_code',
    'pre_req',
    'co_req',
    'course_title',
    'lec_hours',
    'lab_hours',
    'units',
    'tuition_hours',
    'action',
  ];

  constructor(
    private route: ActivatedRoute,
    private curriculumService: CurriculumService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    const curriculumYear = this.route.snapshot.paramMap.get('year');
    if (curriculumYear) {
      this.fetchCurriculum(curriculumYear);
    }

    this.updateCustomExportOptions();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchCurriculum(year: string) {
    this.curriculumService
      .getCurriculumByYear(year)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curriculum) => {
          if (curriculum) {
            this.curriculum = curriculum;
            this.selectedProgram = curriculum.programs[0]?.name || '';
            this.selectedYear = 1;
            this.updateHeaderInputFields();
            this.updateSelectedSemesters();
            this.cdr.markForCheck();
          }
        },
        error: (error) => {
          console.error('Error fetching curriculum:', error);
          this.snackBar.open(
            'Error fetching curriculum. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
        },
      });
  }

  updateHeaderInputFields() {
    const programOptions = this.curriculum?.programs.map((p) => p.name) || [];
    const selectedProgramData = this.curriculum?.programs.find(
      (p) => p.name === this.selectedProgram
    );
    const yearLevelOptions = selectedProgramData
      ? Array.from(
          { length: selectedProgramData.number_of_years },
          (_, i) => i + 1
        )
      : [];

    this.headerInputFields = [
      {
        type: 'select',
        label: 'Program',
        key: 'program',
        options: programOptions,
      },
      {
        type: 'select',
        label: 'Year Level',
        key: 'yearLevel',
        options: yearLevelOptions,
      },
      {
        type: 'section',
        label: 'Sections',
        key: 'sections',
      },
    ];

    const currentYearLevel = this.getYearLevel(this.getProgram());
    this.selectedSections = currentYearLevel?.sections ?? 1;
  }

  updateCustomExportOptions() {
    this.customExportOptions = {
      all: 'Export entire curriculum',
      current: `Export ${this.selectedProgram} curriculum only`,
    };
  }

  updateSelectedSemesters() {
    if (this.curriculum) {
      const program = this.getProgram();
      if (program) {
        const yearLevel = this.getYearLevel(program);
        if (yearLevel) {
          this.selectedSemesters = yearLevel.semesters.map((semester) => ({
            ...semester,
            courses: [...semester.courses],
          }));
          this.cdr.detectChanges();
        }
      }
    }
  }

  onInputChange(values: { [key: string]: any }) {
    let programChanged = false;
    let yearLevelChanged = false;

    if (
      values['program'] !== undefined &&
      values['program'] !== this.selectedProgram
    ) {
      this.selectedProgram = values['program'];
      programChanged = true;
    }
    if (
      values['yearLevel'] !== undefined &&
      values['yearLevel'] !== this.selectedYear
    ) {
      this.selectedYear = values['yearLevel'];
      yearLevelChanged = true;
    }

    if (programChanged || yearLevelChanged) {
      // Reset sections to the current value for the selected program and year level
      const currentYearLevel = this.getYearLevel(this.getProgram());
      this.selectedSections = currentYearLevel?.sections ?? 1;

      // Update the form control value for sections
      const sectionsControl = this.getHeaderFormControl('sections');
      if (sectionsControl) {
        sectionsControl.setValue(this.selectedSections);
      }
    } else if (values['sections'] !== undefined) {
      this.selectedSections = values['sections'] || 1;
      this.updateSections(this.selectedSections);
    }

    this.updateHeaderInputFields();
    this.updateSelectedSemesters();
    this.updateCustomExportOptions();
  }

  onSectionChange(sections: number) {
    this.selectedSections = sections;
    this.updateSections(sections);
  }

  onEditCourse(course: Course) {
    this.handleCourseDialog(course);
  }

  onDeleteCourse(course: Course) {
    this.deleteCourse(course);
  }

  onAddCourse(semester: number) {
    this.handleCourseDialog(undefined, semester);
  }

  onExport() {
    alert('Export functionality not implemented yet');
  }

  onManagePrograms() {
    if (!this.curriculum) return;

    const dialogConfig: DialogConfig = {
      title: 'Manage Programs',
      isEdit: false,
      fields: this.curriculum.programs.map((program) => ({
        label: program.name,
        formControlName: program.name,
        type: 'checkbox' as 'text' | 'number' | 'select' | 'checkbox',
        required: false,
      })),
      initialValue: this.curriculum.programs.reduce((acc, program) => {
        acc[program.name] = true;
        return acc;
      }, {} as { [key: string]: boolean }),
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateCurriculumPrograms(result);
      }
    });
  }

  private getHeaderFormControl(key: string): any {
    const headerComponent = this.tableHeaderComponent;
    if (headerComponent && headerComponent.form) {
      return headerComponent.form.get(key);
    }
    return null;
  }

  private updateSections(sections: number) {
    if (this.curriculum && this.selectedProgram && this.selectedYear) {
      this.curriculumService
        .updateSections(
          this.curriculum.curriculum_year,
          this.selectedProgram,
          this.selectedYear,
          sections
        )
        .subscribe(
          (updatedCurriculum) => {
            this.curriculum = updatedCurriculum;
            this.updateSelectedSemesters();
            this.snackBar.open('Sections updated successfully', 'Close', {
              duration: 3000,
            });
            this.cdr.detectChanges();
          },
          (error) => {
            this.snackBar.open('Error updating sections', 'Close', {
              duration: 3000,
            });
            console.error('Error updating sections:', error);
          }
        );
    }
  }

  private updateCurriculumPrograms(selectedPrograms: {
    [key: string]: boolean;
  }) {
    if (!this.curriculum) return;

    this.curriculum.programs = this.curriculum.programs.filter(
      (program) => selectedPrograms[program.name]
    );

    this.curriculumService.updateEntireCurriculum(this.curriculum).subscribe(
      (updatedCurriculum) => {
        this.curriculum = updatedCurriculum;
        this.updateHeaderInputFields();
        this.updateSelectedSemesters();
        this.snackBar.open('Programs updated successfully', 'Close', {
          duration: 3000,
        });
        this.cdr.detectChanges();
      },
      (error) => {
        this.snackBar.open('Error updating programs', 'Close', {
          duration: 3000,
        });
        console.error('Error updating programs:', error);
      }
    );
  }

  private getCourseDialogConfig(
    course?: Course,
    semester?: number
  ): DialogConfig {
    return {
      title: course ? 'Edit Course' : 'Add Course',
      isEdit: !!course,
      fields: [
        {
          label: 'Course Code',
          formControlName: 'course_code',
          type: 'text',
          maxLength: 10,
          required: true,
        },
        {
          label: 'Pre-requisite',
          formControlName: 'pre_req',
          type: 'text',
          maxLength: 10,
        },
        {
          label: 'Co-requisite',
          formControlName: 'co_req',
          type: 'text',
          maxLength: 10,
        },
        {
          label: 'Course Title',
          formControlName: 'course_title',
          type: 'text',
          maxLength: 80,
          required: true,
        },
        {
          label: 'Lecture Hours',
          formControlName: 'lec_hours',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
        {
          label: 'Laboratory Hours',
          formControlName: 'lab_hours',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
        {
          label: 'Units',
          formControlName: 'units',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
        {
          label: 'Tuition Hours',
          formControlName: 'tuition_hours',
          type: 'number',
          min: 0,
          maxLength: 2,
          required: true,
        },
      ],
      initialValue: course || { semester },
    };
  }

  private handleCourseDialog(course?: Course, semester?: number): void {
    const dialogConfig = this.getCourseDialogConfig(course, semester);
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (course) {
          this.updateCourse(result, course);
        } else {
          this.addNewCourse(result, semester!);
        }
      }
    });
  }

  private addNewCourse(newCourse: Course, semester: number) {
    if (this.curriculum && this.selectedProgram && this.selectedYear) {
      const program = this.getProgram();
      if (program) {
        const yearLevel = this.getYearLevel(program);
        if (yearLevel) {
          const semesterIndex = yearLevel.semesters.findIndex(
            (s) => s.semester === semester
          );
          if (semesterIndex !== -1) {
            yearLevel.semesters[semesterIndex].courses.push(newCourse);
            this.saveCurriculumChanges();
          }
        }
      }
    }
  }

  private updateCourse(updatedCourse: Course, originalCourse: Course) {
    if (this.curriculum && this.selectedProgram && this.selectedYear) {
      const program = this.getProgram();
      if (program) {
        const yearLevel = this.getYearLevel(program);
        if (yearLevel) {
          const semester = this.getSemester(yearLevel, originalCourse);
          if (semester) {
            const courseIndex = semester.courses.findIndex(
              (c) => c.course_code === originalCourse.course_code
            );
            if (courseIndex !== -1) {
              semester.courses[courseIndex] = updatedCourse;
              this.saveCurriculumChanges();
            }
          }
        }
      }
    }
  }

  private deleteCourse(course: Course) {
    if (this.curriculum && this.selectedProgram && this.selectedYear) {
      const program = this.getProgram();
      if (program) {
        const yearLevel = this.getYearLevel(program);
        if (yearLevel) {
          yearLevel.semesters.forEach((semester) => {
            semester.courses = semester.courses.filter(
              (c) => c.course_code !== course.course_code
            );
          });
          this.saveCurriculumChanges();
        }
      }
    }
  }

  private saveCurriculumChanges() {
    if (this.curriculum) {
      this.curriculumService.updateEntireCurriculum(this.curriculum).subscribe(
        (updatedCurriculum) => {
          this.curriculum = updatedCurriculum;
          this.updateSelectedSemesters();
          this.snackBar.open('Changes saved successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.detectChanges();
        },
        (error) => {
          this.snackBar.open('Error saving changes', 'Close', {
            duration: 3000,
          });
          console.error('Error saving changes:', error);
        }
      );
    }
  }

  /* Utility Methods for Data Retrieval */
  private getProgram(): Program | undefined {
    return this.curriculum?.programs.find(
      (p) => p.name === this.selectedProgram
    );
  }

  private getYearLevel(program: Program | undefined): YearLevel | undefined {
    return program?.year_levels.find((y) => y.year === this.selectedYear);
  }

  private getSemester(
    yearLevel: YearLevel,
    course: Course
  ): Semester | undefined {
    return yearLevel?.semesters.find((semester) =>
      semester.courses.some((c) => c.course_code === course.course_code)
    );
  }

  getSemesterDisplay(semester: number): string {
    return this.curriculumService.mapSemesterToEnum(semester);
  }
}
