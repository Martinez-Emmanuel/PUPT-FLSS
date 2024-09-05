import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig, DialogFieldConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

interface Program {
  program_code: string;
  program_title: string;
  year_levels: number;
  sections: string[];
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

  constructor(private dialog: MatDialog, private snackBar: MatSnackBar) {}

  ngOnInit() {
    this.loadSampleData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadSampleData() {
    this.programs = [
      {
        program_code: 'BSIT',
        program_title: 'Bachelor of Science in Information Technology',
        year_levels: 4,
        sections: ['1', '2', '3', '4'],
      },
      {
        program_code: 'BSA',
        program_title: 'Bachelor of Science in Accountancy',
        year_levels: 4,
        sections: ['1', '2', '3', '4', '5'],
      },
    ];
    this.academicYearOptions = ['2022-2023', '2023-2024', '2024-2025'];
    this.headerInputFields[0].options = this.academicYearOptions;
    this.selectedAcademicYear = this.academicYearOptions[0];
  }

  private addNewAcademicYear(newAcademicYear: string): void {
    this.academicYearOptions.push(newAcademicYear);
    this.headerInputFields[0].options = [...this.academicYearOptions];
    this.selectedAcademicYear = newAcademicYear;
  }

  private removeAcademicYear(year: string): void {
    this.academicYearOptions = this.academicYearOptions.filter((y) => y !== year);
    this.headerInputFields[0].options = [...this.academicYearOptions];
    this.selectedAcademicYear = this.academicYearOptions.length ? this.academicYearOptions[0] : '';
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['academicYear'])
      this.selectedAcademicYear = values['academicYear'];
  }

  onManageYearLevels(program: Program) {
    const curriculumVersions = ['2018', '2022', '2024'];
    const fields: DialogFieldConfig[] = [];

    program.sections.forEach((_, index) => {
      fields.push({
        label: `Year Level ${index + 1}`,
        formControlName: `yearLevel${index + 1}`,
        type: 'text',
        required: true,
        disabled: true,
      });
      fields.push({
        label: `Curriculum`,
        formControlName: `curriculumVersion${index + 1}`,
        type: 'select',
        options: curriculumVersions,
        required: true,
      });
    });

    const initialValue = fields.reduce((acc, field) => {
      acc[field.formControlName] =
        field.type === 'text'
          ? `${parseInt(field.formControlName.replace('yearLevel', ''))}`
          : '';
      return acc;
    }, {} as { [key: string]: any });

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: {
        title: `${program.program_code} Year Levels`,
        fields,
        isEdit: true,
        initialValue,
        useHorizontalLayout: true,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log('Updated Curriculum Versions:', result);
        this.snackBar.open('Year levels updated successfully!', 'Close', {
          duration: 3000,
        });
      }
    });
  }

  onManageSections(program: Program) {
    const dialogConfig: DialogConfig = {
      title: `${program.program_code} Sections`,
      fields: [
        {
          label: 'Number of Sections',
          formControlName: 'numberOfSections',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
      isEdit: true,
      initialValue: { numberOfSections: program.sections.length },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        program.sections = Array.from(
          { length: result.numberOfSections },
          (_, i) => (i + 1).toString()
        );
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
          options: undefined, // Explicitly set options to undefined for text inputs
        },
        {
          label: 'Year End',
          formControlName: 'yearEnd',
          type: 'text',
          required: true,
          maxLength: 4,
          options: undefined, // Explicitly set options to undefined for text inputs
        }
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
        if (this.isValidYear(result.yearStart) && this.isValidYear(result.yearEnd)) {
          const newAcademicYear = `${result.yearStart} - ${result.yearEnd}`;
          this.addNewAcademicYear(newAcademicYear);
          this.snackBar.open('New academic year added successfully!', 'Close', {
            duration: 3000,
          });
        } else {
          this.snackBar.open('Invalid year format. Please enter valid 4-digit years.', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }
  
  // Helper method to validate year input
  private isValidYear(year: string): boolean {
    return /^\d{4}$/.test(year) && parseInt(year) > 1900 && parseInt(year) < 2100;
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
