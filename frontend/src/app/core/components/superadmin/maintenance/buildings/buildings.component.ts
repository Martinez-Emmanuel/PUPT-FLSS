import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogExportComponent } from '../../../../../shared/dialog-export/dialog-export.component';

import { Building, BuildingsService } from '../../../../services/superadmin/buildings/buildings.service';

import { fadeAnimation } from '../../../../animations/animations';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
  private buildingsSubject = new BehaviorSubject<Building[]>([]);
  buildings$ = this.buildingsSubject.asObservable();
  private allBuildings: Building[] = [];

  columns = [
    { key: 'index', label: '#' },
    { key: 'building_name', label: 'Building Name' },
    { key: 'floor_levels', label: 'Floor Levels' },
    { key: 'actions', label: 'Actions' },
  ];

  displayedColumns = ['index', 'building_name', 'floor_levels'];

  headerInputFields: InputField[] = [
    { key: 'search', label: 'Search Buildings', type: 'text' },
  ];

  isLoading = true;
  searchControl = new FormControl('');

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private buildingsService: BuildingsService
  ) {}

  ngOnInit() {
    this.fetchBuildings();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchBuildings() {
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
          this.allBuildings = buildings || [];
          this.buildingsSubject.next(buildings || []);
        },
        error: (error) => {
          console.error('Error fetching buildings:', error);
          this.snackBar.open(
            'Error loading buildings. Please try again.',
            'Close',
            {
              duration: 3000,
            }
          );
          this.isLoading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm: string | null) => {
        const term = searchTerm ? searchTerm.trim().toLowerCase() : '';
        if (term) {
          const filteredBuildings = this.allBuildings.filter(
            (building: Building) =>
              building.building_name.toLowerCase().includes(term) ||
              building.floor_levels.toString().includes(term)
          );
          this.buildingsSubject.next(filteredBuildings);
        } else {
          this.buildingsSubject.next(this.allBuildings);
        }
      });
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.searchControl.setValue(values['search']);
    }
  }

  private getDialogConfig(building?: Building): DialogConfig {
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
              const errorMessage =
                error.error?.message || 'Error adding building';
              this.snackBar.open(errorMessage, 'Close', {
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

  private updateBuilding(id: number, building: Partial<Building>) {
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

  // ======================
  // PDF Generation
  // ======================

  private createPdfBlob(): Blob {
    const doc = new jsPDF('p', 'mm', 'legal');
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const logoSize = 22;
    const topMargin = 15;
    let currentY = topMargin;

    try {
      // Add the university logo
      const leftLogoUrl =
        'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';
      doc.addImage(leftLogoUrl, 'PNG', margin, 10, logoSize, logoSize);

      // Add header text
      doc.setFontSize(12);
      doc.setFont('times', 'bold');
      doc.text(
        'POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH',
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );
      currentY += 5;

      doc.setFontSize(12);
      doc.text(
        'Gen. Santos Ave. Upper Bicutan, Taguig City',
        pageWidth / 2,
        currentY,
        { align: 'center' }
      );
      currentY += 10;

      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text('Buildings Report', pageWidth / 2, currentY, {
        align: 'center',
      });
      currentY += 8;

      // Add the horizontal line below the header
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 7;

      const buildings = this.buildingsSubject.getValue();
      const bodyData = buildings.map((building, index) => [
        (index + 1).toString(),
        building.building_name,
        building.floor_levels.toString(),
      ]);

      // Add table to PDF
      (doc as any).autoTable({
        startY: currentY,
        head: [['#', 'Building Name', 'Floor Levels']],
        body: bodyData,
        theme: 'grid',
        headStyles: {
          fillColor: [128, 0, 0],
          textColor: [255, 255, 255],
          fontSize: 9,
        },
        bodyStyles: {
          fontSize: 8,
          textColor: [0, 0, 0],
        },
        styles: {
          lineWidth: 0.1,
          overflow: 'linebreak',
          cellPadding: 2,
        },
        columnStyles: {
          0: { cellWidth: 15 }, // #
          1: { cellWidth: 100 }, // Building Name
          2: { cellWidth: 40 }, // Floor Levels
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data: any) => {
          currentY = data.cursor.y + 10;
        },
      });

      return doc.output('blob');
    } catch (error) {
      this.snackBar.open('Failed to generate PDF.', 'Close', {
        duration: 3000,
      });
      throw error;
    }
  }

  onExport() {
    this.dialog.open(DialogExportComponent, {
      maxWidth: '70rem',
      width: '100%',
      data: {
        exportType: 'all',
        entity: 'Buildings',
        customTitle: 'Export All Buildings',
        generatePdfFunction: (showPreview: boolean) => {
          return this.createPdfBlob();
        },
        generateFileNameFunction: () => 'pup_taguig_buildings_report.pdf',
      },
    });
  }
}
