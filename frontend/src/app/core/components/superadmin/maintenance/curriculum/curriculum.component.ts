import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';

import { CurriculumService, Curriculum } from '../../../../services/superadmin/curriculum/curriculum.service';

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
  ],
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurriculumComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private selectedCurriculumIndex: number | null = null;

  curriculumStatuses = ['Active', 'Inactive'];
  curricula: Curriculum[] = [];
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
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchCurricula() {
    this.curriculumService
      .getCurricula()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curricula) => this.updateCurriculaList(curricula),
        error: () =>
          this.showErrorMessage('Error fetching curricula. Please try again.'),
      });
  }

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

  onExport() {
    alert('Export functionality not implemented yet');
  }

  onViewCurriculum(curriculum: Curriculum) {
    this.router.navigate([
      '/superadmin/curriculum',
      curriculum.curriculum_year,
    ]);
  }

  openAddCurriculumDialog() {
    this.openCurriculumDialog();
  }

  openEditCurriculumDialog(curriculum: Curriculum) {
    this.selectedCurriculumIndex = this.curricula.indexOf(curriculum);
    this.openCurriculumDialog(curriculum);
  }

  private getDialogConfig(curriculum?: Curriculum): DialogConfig {
    return {
      title: 'Curriculum',
      isEdit: !!curriculum,
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
          type: 'select',
          options: this.curriculumStatuses,
          required: true,
        },
      ],
      initialValue: curriculum || { status: 'Active' },
    };
  }

  private openCurriculumDialog(curriculum?: Curriculum) {
    const config = this.getDialogConfig(curriculum);
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        curriculum ? this.updateCurriculum(result) : this.addCurriculum(result);
      }
    });
  }

  private addCurriculum(newCurriculum: Curriculum) {
    this.curriculumService.addCurriculum(newCurriculum).subscribe({
      next: (curricula) => {
        this.updateCurriculaList(curricula);
        this.showSuccessMessage('Curriculum added successfully');
      },
      error: () =>
        this.showErrorMessage('Error adding curriculum. Please try again.'),
    });
  }

  private updateCurriculum(updatedCurriculum: Curriculum) {
    if (this.selectedCurriculumIndex !== null) {
      this.curriculumService
        .updateCurriculum(this.selectedCurriculumIndex, updatedCurriculum)
        .subscribe({
          next: (curricula) => {
            this.updateCurriculaList(curricula);
            this.showSuccessMessage('Curriculum updated successfully');
          },
          error: () =>
            this.showErrorMessage(
              'Error updating curriculum. Please try again.'
            ),
        });
    }
  }

  deleteCurriculum(curriculum: Curriculum) {
    const index = this.curricula.indexOf(curriculum);
    if (index >= 0) {
      this.curriculumService.deleteCurriculum(index).subscribe({
        next: (curricula) => {
          this.updateCurriculaList(curricula);
          this.showSuccessMessage('Curriculum deleted successfully');
        },
        error: () =>
          this.showErrorMessage('Error deleting curriculum. Please try again.'),
      });
    }
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
