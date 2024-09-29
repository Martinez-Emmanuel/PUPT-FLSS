import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { fadeAnimation } from '../../../../animations/animations';

import { CurriculumService, Curriculum, Program } from '../../../../services/superadmin/curriculum/curriculum.service';

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
  ],
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurriculumComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private selectedCurriculumIndex: number | null = null;

  curriculumStatuses = ['Active', 'Inactive'];
  curricula: Curriculum[] = [];
  programs: Program[] = [];
  availableCurriculumYears: string[] = [];
  isLoading = true;

  columns = [
    { key: 'index', label: '#' },
    { key: 'curriculum_year', label: 'Curriculum Year' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = ['index', 'curriculum_year', 'status'];

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
    private curriculumService: CurriculumService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchCurricula();
    // this.fetchPredefinedPrograms(); // Commented out until necessary
    // this.fetchAvailableCurriculumYears(); // Commented out until necessary
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Commented out fetchAvailableCurriculumYears until necessary
  // private fetchAvailableCurriculumYears() {
  //   this.curriculumService
  //     .getAvailableCurriculumYears()
  //     .pipe(takeUntil(this.destroy$))
  //     .subscribe((years) => {
  //       this.availableCurriculumYears = years;
  //       this.cdr.markForCheck();
  //     });
  // }

  private fetchCurricula() {
    this.isLoading = true;
    this.curriculumService
      .getCurricula()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curricula) => {
          this.updateCurriculaList(curricula);
          this.isLoading = false;
        },
        error: () => {
          this.showErrorMessage('Error fetching curricula. Please try again.');
          this.isLoading = false;
        },
      });
  }

  // Commented out fetchPredefinedPrograms until necessary
  // private fetchPredefinedPrograms() {
  //   this.curriculumService.getPredefinedPrograms().subscribe((programs) => {
  //     this.programs = programs;
  //   });
  // }

  private onSearch(searchTerm: string) {
    this.curriculumService
      .getCurricula()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curricula) => {
          this.curricula = curricula.filter(
            (curriculum) =>
              curriculum.curriculum_year.includes(searchTerm) ||
              curriculum.status.toLowerCase().includes(searchTerm.toLowerCase())
          );
          this.cdr.markForCheck();
        },
        error: () =>
          this.showErrorMessage('Error performing search. Please try again.'),
      });
  }

  public onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.onSearch(values['search']);
    }
  }

  onViewCurriculum(curriculum: Curriculum) {
    this.router.navigate([
      '/superadmin/curriculum',
      curriculum.curriculum_year,
    ]);
  }

  openAddCurriculumDialog() {
    this.curriculumService.getCurricula().subscribe({
      next: (availableCurricula) => {
        const dialogConfig = this.getDialogConfig(availableCurricula); // Populate the dialog with available curricula

        const dialogRef = this.dialog.open(TableDialogComponent, {
          data: dialogConfig,
          disableClose: true,
        });

        dialogRef.afterClosed().subscribe((result) => {
          if (result) {
            if (result.copy_from && result.copy_from !== 'None') {
              this.copyCurriculum(result); // Copy the curriculum if a source is selected
            } else {
              this.addCurriculum(result); // Add a new curriculum if no source is selected
            }
          }
        });
      },
      error: () => {
        this.showErrorMessage(
          'Error fetching available curricula. Please try again.'
        );
      },
    });
  }

  private copyCurriculum(copyData: any) {
    const curriculumYearToCopyFrom = copyData.copy_from.split(' ')[0]; // Extract the curriculum year to copy from
    const newCurriculumYear = copyData.curriculum_year; // Get the new curriculum year

    // Find the curriculum_id for the selected curriculum year to copy from
    const curriculumToCopy = this.curricula.find(
      (curriculum) => curriculum.curriculum_year === curriculumYearToCopyFrom
    );

    if (curriculumToCopy && curriculumToCopy.curriculum_id) {
      const curriculumId = curriculumToCopy.curriculum_id;

      // Call the curriculumService to copy the curriculum
      this.curriculumService
        .copyCurriculum(curriculumId, newCurriculumYear)
        .subscribe({
          next: (response) => {
            this.showSuccessMessage(
              'Curriculum copied successfully with new curriculum ID.'
            );
            this.fetchCurricula(); // Refresh the list to show the new curriculum
          },
          error: (error) => {
            this.showErrorMessage(
              'Error copying curriculum. Please try again.'
            );
            console.error('Error:', error);
          },
        });
    } else {
      this.showErrorMessage('Error: Curriculum to copy from not found.');
    }
  }

  private addCurriculum(newCurriculum: Curriculum) {
    const curriculumData = {
      curriculum_year: newCurriculum.curriculum_year,
      status: newCurriculum.status,
    };

    this.curriculumService.addCurriculum(curriculumData).subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);

        // Fetch the updated curricula list after adding the new curriculum
        this.fetchCurricula();
      },
      error: () =>
        this.showErrorMessage('Error adding curriculum. Please try again.'),
    });
  }

  openEditCurriculumDialog(curriculum: Curriculum) {
    this.selectedCurriculumIndex = this.curricula.indexOf(curriculum);
    this.openCurriculumDialog(curriculum);
  }

  private getDialogConfig(
    availableCurricula: Curriculum[],
    existingCurriculum?: Curriculum
  ): DialogConfig {
    const isEdit = !!existingCurriculum;
    return {
      title: isEdit ? 'Edit Curriculum' : 'Add Curriculum',
      isEdit: isEdit,
      fields: [
        {
          label: 'Curriculum Year',
          formControlName: 'curriculum_year',
          type: 'text',
          maxLength: 4,
          required: true,
        },
        {
          label: 'Status',
          formControlName: 'status',
          type: 'select' as const,
          options: ['Active', 'Inactive'],
          required: true,
        },
        ...(isEdit
          ? []
          : [
              {
                label: 'Copy from existing curriculum',
                formControlName: 'copy_from',
                type: 'select' as const,
                options: [
                  'None',
                  ...availableCurricula.map(
                    (curriculum) => `${curriculum.curriculum_year} Curriculum`
                  ),
                ],
                required: false,
              },
            ]),
      ],
      initialValue: isEdit
        ? {
            curriculum_year: existingCurriculum!.curriculum_year,
            status: existingCurriculum!.status,
          }
        : {
            copy_from: 'None',
            status: 'Active',
          },
    };
  }

  private openCurriculumDialog(curriculum?: Curriculum) {
    const availableCurricula = curriculum
      ? this.curricula.filter(
          (c) => c.curriculum_id !== curriculum.curriculum_id
        )
      : this.curricula;
    const config = this.getDialogConfig(availableCurricula, curriculum);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        if (config.isEdit) {
          this.updateCurriculum({ ...curriculum!, ...result });
        } else if (result.copy_from && result.copy_from !== 'None') {
          this.copyCurriculum(result);
        } else {
          this.addCurriculum(result);
        }
      }
    });
  }

  //   dialogRef.afterClosed().subscribe((result) => {
  //     if (result) {
  //       curriculum ? this.updateCurriculum(result) : this.addCurriculum(result);
  //     }
  //   });
  // }

  private updateCurriculum(updatedCurriculum: Curriculum) {
    const curriculumData = {
      curriculum_year: updatedCurriculum.curriculum_year,
      status: updatedCurriculum.status,
    };

    this.curriculumService
      .updateCurriculum(updatedCurriculum.curriculum_id, curriculumData)
      .subscribe({
        next: (response) => {
          this.showSuccessMessage(response.message);

          // Fetch the updated curricula list after the curriculum is updated
          this.fetchCurricula();
        },
        error: () =>
          this.showErrorMessage('Error updating curriculum. Please try again.'),
      });
  }

  deleteCurriculum(curriculum: Curriculum) {
    this.curriculumService
      .deleteCurriculum(curriculum.curriculum_year)
      .subscribe({
        next: (response) => {
          if (response.status === 'fail') {
            this.showErrorMessage(response.message);
          } else {
            this.showSuccessMessage(response.message);
            this.curricula = this.curricula.filter(
              (c) => c.curriculum_id !== curriculum.curriculum_id
            );
            this.updateCurriculaList(this.curricula);
          }
        },
        error: (error) => {
          this.showErrorMessage(
            'Error during the deletion process. Please try again.'
          );
          console.error('Error:', error);
        },
      });
  }

  private updateCurriculaList(curricula: Curriculum[]) {
    this.curricula = curricula;
    this.cdr.markForCheck();
  }

  private showSuccessMessage(message: string) {
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }

  private showErrorMessage(message: string) {
    console.error(message);
    this.snackBar.open(message, 'Close', { duration: 3000 });
  }
}