import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, Subject, takeUntil } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../imports/mat-symbol.directive';

import { TableHeaderComponent, InputField } from '../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig, DialogFieldConfig } from '../../../../shared/table-dialog/table-dialog.component';
import { DialogGenericComponent, DialogData } from '../../../../shared/dialog-generic/dialog-generic.component';
import { LoadingComponent } from '../../../../shared/loading/loading.component';

import { CurriculumService } from '../../../services/superadmin/curriculum/curriculum.service';
import { AcademicYearService } from '../../../services/admin/academic-year/academic-year.service';
import { AcademicYear, Program, YearLevel } from '../../../models/scheduling.model';

import { fadeAnimation, pageFloatUpAnimation } from '../../../animations/animations';

@Component({
  selector: 'app-academic-year',
  imports: [
    CommonModule,
    TableHeaderComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    MatSymbolDirective,
  ],
  templateUrl: './academic-year.component.html',
  styleUrls: ['./academic-year.component.scss'],
  animations: [fadeAnimation, pageFloatUpAnimation],
})
export class AcademicYearComponent implements OnInit, OnDestroy {
  programs: Program[] = [];
  academicYearOptions: { academic_year_id: number; academic_year: string }[] =
    [];
  selectedAcademicYear = '';
  selectedAcademicYearId: number | null = null;
  private destroy$ = new Subject<void>();
  isLoading = true;

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

  academicYearMap: { [name: string]: number } = {};

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private academicYearService: AcademicYearService,
    private curriculumService: CurriculumService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load initial data: academic years and active year.
   */
  loadData() {
    this.isLoading = true;

    forkJoin({
      academicYears: this.academicYearService.getAcademicYears(),
      activeYear: this.academicYearService.getActiveYearAndSemester(),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        ({ academicYears, activeYear }) => {
          // Map academic years for dropdown
          this.academicYearOptions = academicYears.map((ay: AcademicYear) => ({
            academic_year_id: ay.academic_year_id,
            academic_year: ay.academic_year,
          }));

          this.headerInputFields[0].options = this.academicYearOptions.map(
            (ay) => ay.academic_year
          );

          // Find and set the currently active academic year
          const activeAcademicYear = this.academicYearOptions.find(
            (ay) => ay.academic_year === activeYear.activeYear
          );

          if (activeAcademicYear) {
            this.selectedAcademicYear = activeAcademicYear.academic_year;
            this.selectedAcademicYearId = activeAcademicYear.academic_year_id;
          } else if (this.academicYearOptions.length > 0) {
            const latestAcademicYear =
              this.academicYearOptions[0].academic_year;
            const latestAcademicYearId =
              this.academicYearOptions[0].academic_year_id;
            this.selectedAcademicYear = latestAcademicYear;
            this.selectedAcademicYearId = latestAcademicYearId;
          } else {
            this.isLoading = false;
            this.snackBar.open('No academic years available.', 'Close', {
              duration: 3000,
            });
            return;
          }

          this.fetchProgramsForAcademicYear(this.selectedAcademicYear);
        },
        (error) => {
          this.isLoading = false;
          console.error('Error loading data:', error);
          this.snackBar.open('Failed to load data.', 'Close', {
            duration: 3000,
          });
        }
      );
  }

  /**
   * Load academic years and set the latest as selected.
   */
  loadAcademicYears() {
    this.academicYearService
      .getAcademicYears()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (academicYears: AcademicYear[]) => {
          this.academicYearOptions = academicYears.map((ay) => ({
            academic_year_id: ay.academic_year_id,
            academic_year: ay.academic_year,
          }));

          this.headerInputFields[0].options = this.academicYearOptions.map(
            (ay) => ay.academic_year
          );

          if (this.academicYearOptions.length > 0) {
            const latestAcademicYear =
              this.academicYearOptions[0].academic_year;
            const latestAcademicYearId =
              this.academicYearOptions[0].academic_year_id;

            this.selectedAcademicYear = latestAcademicYear;
            this.selectedAcademicYearId = latestAcademicYearId;

            this.fetchProgramsForAcademicYear(latestAcademicYear);
          } else {
            this.snackBar.open('No academic years available.', 'Close', {
              duration: 3000,
            });
          }
        },
        (error) => {
          console.error('Error loading academic years:', error);
          this.snackBar.open('Failed to load academic years.', 'Close', {
            duration: 3000,
          });
        }
      );
  }

  /**
   * Fetch programs associated with the selected academic year.
   * @param academicYear - The selected academic year.
   */
  fetchProgramsForAcademicYear(academicYear: string) {
    const selectedYear = this.academicYearOptions.find(
      (year) => year.academic_year === academicYear
    );

    if (!selectedYear) {
      this.isLoading = false;
      return;
    }

    this.selectedAcademicYearId = selectedYear.academic_year_id;

    this.academicYearService
      .fetchProgramDetailsByAcademicYear({
        academic_year_id: selectedYear.academic_year_id,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (response) => {
          if (response.programs) {
            this.programs = response.programs.map((program: any) => ({
              program_id: program.program_id,
              program_code: program.program_code,
              program_title: program.program_title,
              year_levels: program.year_levels,
              sections: this.getSectionsByProgram(program),
            }));
          }
          this.isLoading = false;
        },
        (error) => {
          this.isLoading = false;
          console.error('Error fetching program details: ', error);
          this.snackBar.open('Failed to fetch program details.', 'Close', {
            duration: 3000,
          });
        }
      );
  }

  /**
   * Extract sections information from a program.
   * @param program - The program object.
   */
  getSectionsByProgram(program: any): { [yearLevel: string]: number } {
    const sections: { [yearLevel: string]: number } = {};
    program.year_levels.forEach((yearLevel: any) => {
      sections[yearLevel.year_level] = yearLevel.number_of_sections;
    });
    return sections;
  }

  /**
   * Handle input changes from the header (e.g., selecting a different academic year).
   * @param values - The key-value pairs of input changes.
   */
  onInputChange(values: { [key: string]: any }) {
    if (values['academicYear']) {
      this.selectedAcademicYear = values['academicYear'];
      this.fetchProgramsForAcademicYear(this.selectedAcademicYear);
    }
  }

  /**
   * Open dialog to manage curriculum for a specific program.
   * @param program - The program to manage.
   */
  onManageCurriculum(program: Program) {
    const fields: DialogFieldConfig[] = [];

    console.log('Fetched Program ID:', program.program_id);

    this.curriculumService.getCurricula().subscribe((curricula) => {
      console.log(curricula);

      const curriculumOptions = curricula.map((curriculum) => ({
        year: curriculum.curriculum_year,
        id: curriculum.curriculum_id,
      }));

      const sortedYearLevels = program.year_levels.sort(
        (a: YearLevel, b: YearLevel) => a.year_level - b.year_level
      );

      if (!Array.isArray(program.year_levels)) {
        console.error(
          'Expected year_levels to be an array, but got:',
          program.year_levels
        );
        return;
      }

      program.year_levels.forEach((yearLevelObj: YearLevel, index: number) => {
        const yearLevel = yearLevelObj.year_level;
        const yearLevelKey = `yearLevel${yearLevel}`;
        const curriculumKey = `curriculumVersion${yearLevel}`;

        fields.push({
          label: `Year Level ${yearLevel}`,
          formControlName: yearLevelKey,
          type: 'text',
          required: true,
          disabled: true,
        });

        fields.push({
          label: `Curriculum Year`,
          formControlName: curriculumKey,
          type: 'select',
          options: curriculumOptions.map((option) => option.year),
          required: true,
        });
      });

      const initialValue = fields.reduce((acc, field) => {
        if (field.type === 'text') {
          acc[field.formControlName] = field.label.replace('Year Level ', '');
        } else if (field.type === 'select') {
          const yearLevel = parseInt(
            field.formControlName.replace('curriculumVersion', ''),
            10
          );
          const yearLevelObj = sortedYearLevels.find(
            (yl) => yl.year_level === yearLevel
          );
          acc[field.formControlName] = yearLevelObj
            ? yearLevelObj.curriculum_year
            : '';
        }
        return acc;
      }, {} as { [key: string]: any });

      const dialogRef = this.dialog.open(TableDialogComponent, {
        data: {
          title: `Manage ${program.program_code} Curriculum`,
          fields,
          isEdit: true,
          initialValue,
          useHorizontalLayout: true,
        },
        disableClose: true,
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          if (!Array.isArray(program.year_levels)) {
            console.error(
              'Expected year_levels to be an array after dialog close.'
            );
            return;
          }

          const updatedYearLevels = program.year_levels.map((yearLevelObj) => {
            const curriculumKey = `curriculumVersion${yearLevelObj.year_level}`;
            const selectedCurriculumYear = result[curriculumKey];

            const matchingCurriculum = curricula.find(
              (c) => c.curriculum_year === selectedCurriculumYear
            );

            return {
              ...yearLevelObj,
              curriculum_year: selectedCurriculumYear,
              curriculum_id: matchingCurriculum
                ? matchingCurriculum.curriculum_id
                : yearLevelObj.curriculum_id,
            };
          });

          if (this.selectedAcademicYearId != null) {
            this.academicYearService
              .updateYearLevelsCurricula(
                this.selectedAcademicYearId,
                program.program_id,
                updatedYearLevels
              )
              .subscribe(
                (response) => {
                  this.snackBar.open(
                    'Year levels updated successfully.',
                    'Close',
                    { duration: 3000 }
                  );
                  this.fetchProgramsForAcademicYear(this.selectedAcademicYear);
                },
                (error) => {
                  console.error('Failed to update year levels:', error);
                }
              );
          } else {
            console.error('selectedAcademicYearId is null or undefined.');
          }
        }
      });
    });
  }

  /**
   * Open dialog to manage sections for a specific program.
   * @param program - The program to manage.
   */
  onManageSections(program: Program) {
    const fields: DialogFieldConfig[] = [];

    const sortedYearLevels = program.year_levels.sort(
      (a: YearLevel, b: YearLevel) => a.year_level - b.year_level
    );

    if (!Array.isArray(sortedYearLevels)) {
      console.error(
        'Expected year_levels to be an array, but got:',
        sortedYearLevels
      );
      return;
    }

    sortedYearLevels.forEach((yearLevelObj: YearLevel) => {
      const yearLevelKey = `yearLevel${yearLevelObj.year_level}`;
      const sectionsKey = `numberOfSections${yearLevelObj.year_level}`;

      fields.push({
        label: `Year Level ${yearLevelObj.year_level}`,
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
    });

    const initialValue = fields.reduce((acc, field) => {
      if (field.type === 'text') {
        acc[field.formControlName] = field.label.replace('Year Level ', '');
      } else if (field.type === 'number') {
        const yearLevel = parseInt(
          field.formControlName.replace('numberOfSections', ''),
          10
        );
        acc[field.formControlName] =
          program.sections[yearLevel.toString()] || 1;
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
        let changesMade = false;
        sortedYearLevels.forEach((yearLevelObj) => {
          const sectionsKey = `numberOfSections${yearLevelObj.year_level}`;
          const numberOfSections = result[sectionsKey];

          if (
            numberOfSections !==
            program.sections[yearLevelObj.year_level.toString()]
          ) {
            changesMade = true;

            if (this.selectedAcademicYearId != null) {
              this.academicYearService
                .updateSections(
                  this.selectedAcademicYearId,
                  program.program_id,
                  yearLevelObj.year_level,
                  numberOfSections
                )
                .subscribe(
                  (response) => {
                    console.log(
                      `Year Level ${yearLevelObj.year_level} updated successfully.`
                    );
                  },
                  (error) => {
                    console.error(
                      `Failed to update Year Level ${yearLevelObj.year_level}`,
                      error
                    );
                  }
                );
            } else {
              console.error('selectedAcademicYearId is null or undefined.');
            }
          }
        });

        if (changesMade) {
          this.snackBar.open('Sections updated successfully.', 'Close', {
            duration: 3000,
          });
          this.fetchProgramsForAcademicYear(this.selectedAcademicYear);
        } else {
          this.snackBar.open('No changes detected!', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  /**
   * Remove a program from the selected academic year.
   * @param program - The program to remove.
   */
  onRemoveProgram(program: Program) {
    const dialogData: DialogData = {
      title: 'Confirm Delete',
      content: `Are you sure you want to delete the program 
        "${program.program_code}"? This action cannot be undone.`,
      actionText: 'Delete',
      cancelText: 'Cancel',
      action: 'Delete',
    };

    const dialogRef = this.dialog.open(DialogGenericComponent, {
      data: dialogData,
      disableClose: true,
      panelClass: 'dialog-base',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'Delete') {
        if (this.selectedAcademicYearId != null) {
          this.academicYearService
            .removeProgramFromAcademicYear(
              this.selectedAcademicYearId,
              program.program_id
            )
            .subscribe(
              (response) => {
                if (response.status === 'success') {
                  this.programs = this.programs.filter(
                    (p) => p.program_id !== program.program_id
                  );

                  this.snackBar.open(response.message, 'Close', {
                    duration: 3000,
                  });

                  this.fetchProgramsForAcademicYear(this.selectedAcademicYear);
                } else if (response.status === 'error' && response.message) {
                  this.snackBar.open(response.message, 'Close', {
                    duration: 5000,
                  });
                }
              },
              (error) => {
                let errorMessage =
                  'Failed to delete the program. Please try again.';
                if (error.error && error.error.message) {
                  errorMessage = error.error.message;
                } else if (error.message) {
                  errorMessage = error.message;
                }
                this.snackBar.open(errorMessage, 'Close', {
                  duration: 5000,
                });
              }
            );
        } else {
          console.error('selectedAcademicYearId is null or undefined.');
          this.snackBar.open('Invalid academic year selection.', 'Close', {
            duration: 3000,
          });
        }
      }
    });
  }

  /**
   * Open dialog to add a new academic year.
   */
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
          disabled: true,
        },
      ],
      isEdit: false,
      useHorizontalLayout: true,
      initialValue: { yearStart: '', yearEnd: '' },
    };

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: dialogConfig,
      disableClose: true,
      autoFocus: true,
      panelClass: 'add-academic-year-dialog',
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.yearStart && result.yearEnd) {
        if (
          this.isValidYear(result.yearStart) &&
          this.isValidYear(result.yearEnd)
        ) {
          this.academicYearService
            .addAcademicYear(result.yearStart, result.yearEnd)
            .subscribe(
              (response) => {
                this.snackBar.open(
                  'New academic year added successfully.',
                  'Close',
                  {
                    duration: 3000,
                  }
                );
                this.loadAcademicYears();
              },
              (error) => {
                const errorMessage =
                  error.message ||
                  'Failed to add academic year. Please try again.';
                this.snackBar.open(errorMessage, 'Close', {
                  duration: 5000,
                });
              }
            );
        } else {
          this.snackBar.open(
            'Invalid year format. Please enter valid 4-digit years.',
            'Close',
            { duration: 3000 }
          );
        }
      }
    });
  }

  /**
   * Validate the year format.
   * @param year - The year string to validate.
   */
  private isValidYear(year: string): boolean {
    return (
      /^\d{4}$/.test(year) && parseInt(year) > 1900 && parseInt(year) < 2100
    );
  }

  /**
   * Open dialog to manage academic years (e.g., delete).
   */
  openManageAcademicYearDialog(): void {
    forkJoin({
      academicYears: this.academicYearService.getAcademicYears(),
      activeDetails: this.academicYearService.getActiveYearAndSemester(),
    }).subscribe({
      next: ({ academicYears, activeDetails }) => {
        this.academicYearMap = {};
        const academicYearNames = academicYears.map((year) => {
          this.academicYearMap[year.academic_year] = year.academic_year_id;
          return year.academic_year;
        });

        const dialogConfig: DialogConfig = {
          title: 'Manage Academic Years',
          isManageList: true,
          academicYearList: academicYearNames,
          fields: [],
          isEdit: false,
        };

        const dialogRef = this.dialog.open(TableDialogComponent, {
          data: dialogConfig,
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result && result.deletedYear) {
            const deletedYearId = this.academicYearMap[result.deletedYear];
            const activeYearId = this.academicYearMap[activeDetails.activeYear];

            if (deletedYearId === activeYearId) {
              this.snackBar.open(
                'Cannot delete the current set active academic year.',
                'Close',
                {
                  duration: 3000,
                }
              );
            } else {
              this.deleteAcademicYear(deletedYearId);
            }
          }
        });
      },
      error: (error) => {
        console.error('Error fetching academic years:', error);
        this.snackBar.open('Failed to fetch academic years.', 'Close', {
          duration: 3000,
        });
      },
    });
  }

  /**
   * Delete an academic year by ID.
   * @param academicYearId - The ID of the academic year to delete.
   */
  deleteAcademicYear(academicYearId: number): void {
    this.academicYearService.deleteAcademicYear(academicYearId).subscribe(
      (response) => {
        this.snackBar.open('Academic year deleted successfully.', 'Close', {
          duration: 3000,
        });
        this.loadAcademicYears();
      },
      (error) => {
        console.error('Error deleting academic year:', error);
        this.snackBar.open('Failed to delete academic year.', 'Close', {
          duration: 3000,
        });
      }
    );
  }
}
