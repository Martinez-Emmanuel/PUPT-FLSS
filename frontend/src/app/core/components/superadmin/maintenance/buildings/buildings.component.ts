import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';

import { Building, BuildingsService } from '../../../../services/superadmin/buildings/buildings.service';

import { fadeAnimation } from '../../../../animations/animations';

@Component({
  selector: 'app-buildings',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
  ],
  templateUrl: './buildings.component.html',
  styleUrls: ['./buildings.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BuildingsComponent implements OnInit, OnDestroy {
  selectedBuildingIndex: number | null = null;

  private buildingsSubject = new BehaviorSubject<Building[]>([]);
  buildings$ = this.buildingsSubject.asObservable();

  columns = [
    { key: 'index', label: '#' },
    { key: 'building_name', label: 'Building Name' },
    { key: 'floor_levels', label: 'Floor Levels' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' },
    { key: 'actions', label: 'Actions' },
  ];

  displayedColumns = [
    'index',
    'building_name',
    'floor_levels',
    'created_at',
    'updated_at',
  ];

  headerInputFields: InputField[] = [
    { key: 'building_name', label: 'Building Name', type: 'text' },
    { key: 'floor_levels', label: 'Floor Levels', type: 'number' },
  ];

  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private buildingsService: BuildingsService
  ) {}

  ngOnInit() {
    this.fetchBuildings();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchBuildings() {
    this.isLoading = true;
    this.buildingsService
      .getBuildings()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (buildings) => {
          this.buildingsSubject.next(buildings);
        },
        error: (error) => {
          console.error('Error fetching buildings:', error);
          this.snackBar.open('Error fetching buildings', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  onInputChange(values: { [key: string]: any }) {
    console.log('Input values changed:', values);
  }

  onSearch(searchTerm: string) {
    if (!searchTerm) {
      this.fetchBuildings();
      return;
    }

    const buildings = this.buildingsSubject.value;
    const filteredBuildings = buildings.filter((building) =>
      Object.values(building).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    this.buildingsSubject.next(filteredBuildings);
  }

  getDialogConfig(building?: Building): DialogConfig {
    return {
      title: building ? 'Edit Building' : 'Add Building',
      isEdit: !!building,
      initialValue: building
        ? {
            building_name: building.building_name,
            floor_levels: building.floor_levels,
          }
        : undefined,
      fields: [
        {
          label: 'Building Name',
          formControlName: 'building_name',
          type: 'text',
          required: true,
          maxLength: 191,
        },
        {
          label: 'Floor Levels',
          formControlName: 'floor_levels',
          type: 'number',
          required: true,
          min: 1,
        },
      ],
    };
  }

  openAddBuildingDialog() {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: this.getDialogConfig(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.buildingsService
          .createBuilding(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Building added successfully', 'Close', {
                duration: 3000,
              });
              this.fetchBuildings();
            },
            error: (error) => {
              console.error('Error adding building:', error);
              this.snackBar.open('Error adding building', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  openEditBuildingDialog(building: Building) {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: this.getDialogConfig(building),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.updateBuilding(building.building_id, result);
      }
    });
  }

  updateBuilding(id: number, building: Partial<Building>) {
    this.buildingsService
      .updateBuilding(id, building)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(
            response.message || 'Building updated successfully',
            'Close',
            {
              duration: 3000,
            }
          );
          this.fetchBuildings();
        },
        error: (error) => {
          const errorMessage =
            error.error?.message || 'Error updating building';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
          });
        },
      });
  }

  deleteBuilding(building: Building) {
    this.buildingsService
      .deleteBuilding(building.building_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.snackBar.open(
            response.message || 'Building deleted successfully',
            'Close',
            {
              duration: 3000,
            }
          );
          this.fetchBuildings();
        },
        error: (error) => {
          const errorMessage =
            error.error?.message || 'Error deleting building';
          this.snackBar.open(errorMessage, 'Close', {
            duration: 3000,
          });
        },
      });
  }
}
