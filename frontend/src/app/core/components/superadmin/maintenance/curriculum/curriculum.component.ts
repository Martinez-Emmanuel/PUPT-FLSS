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
  CurriculumService,
  Curriculum,
} from '../../../../services/superadmin/curriculum/curriculum.service';

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
export class CurriculumComponent implements OnInit {
  curriculumStatuses = ['Active', 'Inactive'];
  selectedCurriculumIndex: number | null = null;

  curricula: Curriculum[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'curriculum_year', label: 'Curriculum Year' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = ['index', 'curriculum_year', 'status'];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private curriculumService: CurriculumService
  ) {}

  ngOnInit() {
    this.fetchCurricula();
  }

  fetchCurricula() {
    this.curriculumService.getCurricula().subscribe((curricula) => {
      this.curricula = curricula;
      this.cdr.markForCheck();
    });
  }

  onSearch(searchTerm: string) {
    this.curriculumService.getCurricula().subscribe((curricula) => {
      this.curricula = curricula.filter(
        (curriculum) =>
          curriculum.curriculum_year.includes(searchTerm) ||
          curriculum.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.cdr.markForCheck();
    });
  }

  onViewCurriculum(curriculum: Curriculum) {
    this.snackBar.open('Curriculum viewed here.', 'Close', {
      duration: 3000,
    });
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

  openAddCurriculumDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.curriculumService.addCurriculum(result).subscribe((curricula) => {
          this.curricula = curricula;
          this.snackBar.open('Curriculum added successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        });
      }
    });
  }

  openEditCurriculumDialog(curriculum: Curriculum) {
    this.selectedCurriculumIndex = this.curricula.indexOf(curriculum);
    const config = this.getDialogConfig(curriculum);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedCurriculumIndex !== null) {
        this.updateCurriculum(result);
      }
    });
  }

  updateCurriculum(updatedCurriculum: any) {
    if (this.selectedCurriculumIndex !== null) {
      this.curricula[this.selectedCurriculumIndex] = {
        ...this.curricula[this.selectedCurriculumIndex],
        ...updatedCurriculum,
      };

      this.curriculumService
        .updateCurriculum(this.selectedCurriculumIndex, updatedCurriculum)
        .subscribe((curricula) => {
          this.curricula = curricula;
          this.snackBar.open('Curriculum updated successfully', 'Close', {
            duration: 3000,
          });
          this.cdr.markForCheck();
        });
    }
  }

  deleteCurriculum(curriculum: Curriculum) {
    const index = this.curricula.indexOf(curriculum);
    if (index >= 0) {
      this.curriculumService.deleteCurriculum(index).subscribe((curricula) => {
        this.curricula = curricula;
        this.snackBar.open('Curriculum deleted successfully', 'Close', {
          duration: 3000,
        });
        this.cdr.markForCheck();
      });
    }
  }
}
