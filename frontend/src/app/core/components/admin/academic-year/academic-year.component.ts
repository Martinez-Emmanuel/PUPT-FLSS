import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig, DialogFieldConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';

import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';
import { SchedulingService } from '../../../services/admin/scheduling/scheduling.service';

interface Program {
  program_code: string;
  program_title: string;
  year_levels: number;
  sections: { [yearLevel: string]: number };
  curriculums: { [yearLevel: string]: string };
}

type AcademicYear = string;

@Component({
  selector: 'app-academic-year',
  standalone: true,
  imports: [
    CommonModule,
    TableHeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './academic-year.component.html',
  styleUrls: ['./academic-year.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class AcademicYearComponent implements OnInit, OnDestroy {
  programs: Program[] = [];
  academicYearOptions: AcademicYear[] = [];
  selectedAcademicYear = '';
  private destroy$ = new Subject<void>();

  headerInputFields: InputField[] = [
    {
      type: 'select',
      label: 'Academic Year',
      key: 'academicYear',
      options: [],
    },
  ];

  displayedColumns: string[] = [
    'index',
    'program_code',
    'program_title',
    'year_levels',
    'sections',
    'action',
  ];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private schedulingService: SchedulingService
  ) {}

  ngOnInit() {
    this.loadSampleData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSampleData() {
    this.schedulingService
      .getAcademicYears()
      .pipe(takeUntil(this.destroy$))
      .subscribe((academicYears) => {
        this.academicYearOptions = academicYears.map((ay) => ay.year);
        this.headerInputFields[0].options = this.academicYearOptions;
        this.selectedAcademicYear = this.academicYearOptions[0];
      });
      
    this.schedulingService
      .getPrograms()
      .pipe(takeUntil(this.destroy$))
      .subscribe((programs) => {
        this.programs = programs.map((program) => ({
          program_code: program.name,
          program_title: program.name,
          year_levels: program.number_of_years,
          sections: this.getSectionsByProgram(
            program.name,
            program.number_of_years
          ),
          curriculums: this.getCurriculumsByProgram(
            program.name,
            program.number_of_years
          ),
        }));
      });
  }

  private getSectionsByProgram(
    programCode: string,
    numberOfYears: number
  ): { [yearLevel: string]: number } {
    const sections: { [yearLevel: string]: number } = {};
    for (let year = 1; year <= numberOfYears; year++) {
      this.schedulingService
        .getSections(programCode, year)
        .pipe(takeUntil(this.destroy$))
        .subscribe((sectionsList) => {
          sections[year.toString()] = sectionsList.length;
        });
    }
    return sections;
  }

  private getCurriculumsByProgram(
    programCode: string,
    numberOfYears: number
  ): { [yearLevel: string]: string } {
    const curriculums: { [yearLevel: string]: string } = {};
    this.schedulingService
      .getActiveYearAndSemester()
      .pipe(takeUntil(this.destroy$))
      .subscribe(({ activeYear }) => {
        const mapping =
          this.schedulingService['mockData'].curriculumMapping[activeYear]?.[
            programCode
          ];
        for (let year = 1; year <= numberOfYears; year++) {
          curriculums[year.toString()] = mapping ? mapping[year] : '2022';
        }
      });
    return curriculums;
  }

  private addNewAcademicYear(newAcademicYear: string): void {
    this.academicYearOptions.push(newAcademicYear);
    this.headerInputFields[0].options = [...this.academicYearOptions];
    this.selectedAcademicYear = newAcademicYear;
  }

  private removeAcademicYear(year: string): void {
    this.academicYearOptions = this.academicYearOptions.filter(
      (y) => y !== year
    );
    this.headerInputFields[0].options = [...this.academicYearOptions];
    this.selectedAcademicYear = this.academicYearOptions.length
      ? this.academicYearOptions[0]
      : '';
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['academicYear'])
      this.selectedAcademicYear = values['academicYear'];
  }

  onManageYearLevels(program: Program) {
    const curriculumVersions = ['2018', '2022', '2024'];
    const fields: DialogFieldConfig[] = [];

    for (let i = 0; i < program.year_levels; i++) {
      const yearLevelKey = `yearLevel${i + 1}`;
      const curriculumKey = `curriculumVersion${i + 1}`;

      fields.push({
        label: `Year Level ${i + 1}`,
        formControlName: yearLevelKey,
        type: 'text',
        required: true,
        disabled: true,
      });

      fields.push({
        label: `Curriculum`,
        formControlName: curriculumKey,
        type: 'select',
        options: curriculumVersions,
        required: true,
      });
    }

    const initialValue = fields.reduce((acc, field) => {
      if (field.type === 'text') {
        acc[field.formControlName] = `${parseInt(
          field.formControlName.replace('yearLevel', '')
        )}`;
      } else if (field.type === 'select') {
        const yearLevelIndex = field.formControlName.replace(
          'curriculumVersion',
          ''
        );
        acc[field.formControlName] = program.curriculums[yearLevelIndex] || '';
      }
      return acc;
    }, {} as { [key: string]: any });

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: {
        title: `Manage ${program.program_code} Year Levels`,
        fields,
        isEdit: true,
        initialValue,
        useHorizontalLayout: true,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        for (let i = 0; i < program.year_levels; i++) {
          const curriculumKey = `curriculumVersion${i + 1}`;
          program.curriculums[(i + 1).toString()] = result[curriculumKey];
        }

        this.programs = [...this.programs];

        console.log('Updated Curriculum Versions:', result);
        this.snackBar.open('Year levels updated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onManageSections(program: Program) {
    const fields: DialogFieldConfig[] = [];

    for (let i = 0; i < program.year_levels; i++) {
      const yearLevelKey = `yearLevel${i + 1}`;
      const sectionsKey = `numberOfSections${i + 1}`;

      fields.push({
        label: `Year Level ${i + 1}`,
        formControlName: yearLevelKey,
        type: 'text',
        required: true,
        disabled: true,
      });

      fields.push({
        label: `Number of Sections`,
        formControlName: sectionsKey,
        type: 'number',
        required: true,
        min: 1,
      });
    }

    const initialValue = fields.reduce((acc, field) => {
      if (field.type === 'text') {
        acc[field.formControlName] = `${parseInt(
          field.formControlName.replace('yearLevel', '')
        )}`;
      } else if (field.type === 'number') {
        const yearLevelIndex = field.formControlName.replace(
          'numberOfSections',
          ''
        );
        acc[field.formControlName] = program.sections[yearLevelIndex] || 1;
      }
      return acc;
    }, {} as { [key: string]: any });

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: {
        title: `Manage ${program.program_code} Sections`,
        fields,
        isEdit: true,
        initialValue,
        useHorizontalLayout: true,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        for (let i = 0; i < program.year_levels; i++) {
          const sectionsKey = `numberOfSections${i + 1}`;
          program.sections[(i + 1).toString()] = result[sectionsKey];
        }
        this.programs = [...this.programs];
        this.snackBar.open('Sections updated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onRemoveProgram(element: Program) {
    const dialogData: DialogData = {
      title: 'Confirm Delete',
      content:
        'Are you sure you want to delete this? This action cannot be undone.',
      actionText: 'Delete',
      cancelText: 'Cancel',
      action: 'Delete',
    };

    const dialogRef = this.dialog.open(DialogGenericComponent, {
      data: dialogData,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'Delete') {
        this.programs = this.programs.filter((p) => p !== element);
        this.snackBar.open('Program deleted successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  openAddAcademicYearDialog(): void {
    const dialogConfig: DialogConfig = {
      title: 'Add Academic Year',
      fields: [
        {
          label: 'Year Start',
          formControlName: 'yearStart',
          type: 'text',
          required: true,
          maxLength: 4,
        },
        {
          label: 'Year End',
          formControlName: 'yearEnd',
          type: 'text',
          required: true,
          maxLength: 4,
        },
      ],
      isEdit: false,
      useHorizontalLayout: true,
      initialValue: { yearStart: '', yearEnd: '' },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.yearStart && result.yearEnd) {
        if (
          this.isValidYear(result.yearStart) &&
          this.isValidYear(result.yearEnd)
        ) {
          const newAcademicYear = `${result.yearStart} - ${result.yearEnd}`;
          this.addNewAcademicYear(newAcademicYear);
          this.snackBar.open('New academic year added successfully!', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open(
            'Invalid year format. Please enter valid 4-digit years.',
            'Close',
            {
              duration: 3000,
            }
          );
        }
      }
    });
  }

  private isValidYear(year: string): boolean {
    return (
      /^\d{4}$/.test(year) && parseInt(year) > 1900 && parseInt(year) < 2100
    );
  }

  openManageAcademicYearDialog(): void {
    const dialogConfig: DialogConfig = {
      title: 'Manage Academic Years',
      isManageList: true,
      academicYearList: [...this.academicYearOptions],
      fields: [],
      isEdit: false,
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.deletedYear) {
        this.removeAcademicYear(result.deletedYear);
        this.snackBar.open('Academic year removed successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  private handleError(message: string) {
    return (error: any) => {
      console.error(`${message}:`, error);
    };
  }
}
