import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Commented out components that are not yet necessary
import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { fadeAnimation } from '../../../../animations/animations';

import { CurriculumService, Curriculum, Program } from '../../../../services/superadmin/curriculum/curriculum.service';

@Component({
  selector: 'app-curriculum',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent, // Commented out for now
    TableHeaderComponent,  // Commented out for now
  ],
  templateUrl: './curriculum.component.html',
  styleUrls: ['./curriculum.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CurriculumComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private selectedCurriculumIndex: number | null = null;

  curriculumStatuses = ['active', 'inactive'];
  curricula: Curriculum[] = [];
  programs: Program[] = [];
  availableCurriculumYears: string[] = [];
  
  // Commented out columns and displayedColumns until necessary
  columns = [
    { key: 'index', label: '#' },
    { key: 'curriculum_year', label: 'Curriculum Year' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = ['index', 'curriculum_year', 'status'];

  // Commented out headerInputFields until necessary
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
    this.curriculumService
      .getCurricula()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (curricula) => this.updateCurriculaList(curricula),
        error: () =>
          this.showErrorMessage('Error fetching curricula. Please try again.'),
      });
  }

  // Commented out fetchPredefinedPrograms until necessary
  // private fetchPredefinedPrograms() {
  //   this.curriculumService.getPredefinedPrograms().subscribe((programs) => {
  //     this.programs = programs;
  //   });
  // }

  // Commented out onSearch until necessary
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

  // Commented out onInputChange until necessary
  public onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.onSearch(values['search']);
    }
  }

  // Commented out onExport until necessary
  onExport() {
    alert('Export functionality not implemented yet');
  }

  onViewCurriculum(curriculum: Curriculum) {
    this.router.navigate([
      '/superadmin/curriculum',
      curriculum.curriculum_year,
    ]);
  }

  // Commented out dialog functions until necessary
  openAddCurriculumDialog() {
    this.curriculumService.getCurricula().subscribe({
        next: (availableCurricula) => {
            // Convert curriculum_id to a number
            availableCurricula = availableCurricula.map(curriculum => ({
                ...curriculum,
                curriculum_id: Number(curriculum.curriculum_id)  // Convert string to number
            }));

            const dialogConfig = this.getDialogConfig();

            if (dialogConfig.fields) {
                const copyField = dialogConfig.fields.find(field => field.formControlName === 'copy_from');
                if (copyField) {
                    copyField.options = [
                        'None', // Default option
                        ...availableCurricula.map(curriculum => `${curriculum.curriculum_year} Curriculum `)
                    ];
                }
            }

            const dialogRef = this.dialog.open(TableDialogComponent, {
                data: dialogConfig,
                disableClose: true,
            });

            dialogRef.afterClosed().subscribe(result => {
                if (result) {
                    if (result.copy_from && result.copy_from !== 'None') {
                        // Call the backend API to copy the selected curriculum
                        this.copyCurriculum(result);
                    } else {
                        // No curriculum copy, just add a new one
                        this.addCurriculum(result);
                    }
                }
            });
        },
        error: () => this.showErrorMessage('Error fetching available curricula. Please try again.')
    });
  }

  private copyCurriculum(copyData: any) {
    const curriculumYearToCopyFrom = copyData.copy_from.split(' ')[0];
    const newCurriculumYear = copyData.curriculum_year;
  
    // Find the curriculum_id for the selected curriculum year to copy from
    const curriculumToCopy = this.curricula.find(curriculum => curriculum.curriculum_year === curriculumYearToCopyFrom);
  
    if (curriculumToCopy && curriculumToCopy.curriculum_id) {
      const curriculumId = curriculumToCopy.curriculum_id;
  
      this.curriculumService.copyCurriculum(curriculumId, newCurriculumYear).subscribe({
        next: (response) => {
          this.showSuccessMessage('Curriculum copied successfully');
          this.fetchCurricula(); // Refresh the list after copying
        },
        error: () => this.showErrorMessage('Error copying curriculum. Please try again.'),
      });
    } else {
      this.showErrorMessage('Error: Curriculum to copy from not found.');
    }
  }
  
  private addCurriculum(newCurriculum: Curriculum) {
    const curriculumData = {
      curriculum_year: newCurriculum.curriculum_year,
      status: newCurriculum.status
    };
  
    this.curriculumService.addCurriculum(curriculumData).subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);
  
        // Fetch the updated curricula list after adding the new curriculum
        this.fetchCurricula();
      },
      error: () => this.showErrorMessage('Error adding curriculum. Please try again.'),
    });
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
            {
                label: 'Copy a curriculum',
                formControlName: 'copy_from',
                type: 'select',
                hint: `Copy from another curriculum. 
                       You can still adjust the copied curriculum later.`,
                options: [], // Will be populated dynamically in `openAddCurriculumDialog`
                required: false,
            },
        ],
        initialValue: {
            ...curriculum,
            copy_from: 'None',
            status: curriculum?.status || 'Active',
        },
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
          this.updateCurriculum({ ...curriculum, ...result });  // Ensure curriculum_id is passed
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
      status: updatedCurriculum.status
    };
  
    this.curriculumService.updateCurriculum(updatedCurriculum.curriculum_id, curriculumData).subscribe({
      next: (response) => {
        this.showSuccessMessage(response.message);
  
        // Fetch the updated curricula list after the curriculum is updated
        this.fetchCurricula();
      },
      error: () => this.showErrorMessage('Error updating curriculum. Please try again.'),
    });
  }
  

  deleteCurriculum(curriculum: Curriculum) {
      this.curriculumService.deleteCurriculum(curriculum.curriculum_year).subscribe({
        next: (response) => {
          this.showSuccessMessage(response.message);
  
          // Remove the deleted curriculum from the local list
          this.curricula = this.curricula.filter(c => c.curriculum_id !== curriculum.curriculum_id);
          this.updateCurriculaList(this.curricula);
        },
        error: () => this.showErrorMessage('Error deleting curriculum. Please try again.'),
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
