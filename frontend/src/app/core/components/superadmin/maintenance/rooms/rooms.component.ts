import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { takeUntil, map, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableDialogComponent, DialogConfig, SelectOption } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogExportComponent } from '../../../../../shared/dialog-export/dialog-export.component';

import { Room, RoomService } from '../../../../services/superadmin/rooms/rooms.service';
import { Building, BuildingsService } from '../../../../services/superadmin/buildings/buildings.service';

import { fadeAnimation } from '../../../../animations/animations';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-rooms',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomsComponent implements OnInit, OnDestroy {
  roomTypes = ['Lecture', 'Laboratory', 'Office'];
  selectedRoomIndex: number | null = null;

  private roomsSubject = new BehaviorSubject<Room[]>([]);
  rooms$ = this.roomsSubject.asObservable();
  private allRooms: Room[] = [];

  private buildingsSubject = new BehaviorSubject<Building[]>([]);
  buildings$ = this.buildingsSubject.asObservable();

  columns = [
    { key: 'index', label: '#' },
    { key: 'room_code', label: 'Room Code' },
    { key: 'building_name', label: 'Building' },
    { key: 'floor_level', label: 'Floor Level' },
    { key: 'room_type', label: 'Room Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  displayedColumns = [
    'index',
    'room_code',
    'building_name',
    'floor_level',
    'room_type',
    'capacity',
    'status',
  ];

  headerInputFields: InputField[] = [
    { key: 'search', label: 'Search Rooms', type: 'text' },
    // { key: 'room_code', label: 'Room Code', type: 'text' },
    // { key: 'capacity', label: 'Capacity', type: 'number' },
  ];

  isLoading = true;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private roomService: RoomService,
    private buildingsService: BuildingsService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchBuildings();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchRooms() {
    this.isLoading = true;
    this.roomService
      .getRooms()
      .pipe(
        takeUntil(this.destroy$),
        map((rooms) => {
          const buildings = this.buildingsSubject.value;
          return rooms.map((room) => ({
            ...room,
            building_name:
              buildings.find((b) => b.building_id === room.building_id)
                ?.building_name || '',
          }));
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (rooms) => {
          this.allRooms = rooms;
          this.roomsSubject.next(rooms);
        },
        error: (error) => {
          console.error('Error fetching rooms:', error);
          this.snackBar.open('Error fetching rooms', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  fetchBuildings() {
    this.isLoading = true;
    this.buildingsService
      .getBuildings()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (buildings) => {
          this.buildingsSubject.next(buildings);
          this.fetchRooms();
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error fetching buildings:', error);
          this.snackBar.open('Error fetching buildings', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm: string | null) => {
        const term = searchTerm ? searchTerm.trim().toLowerCase() : '';
        if (term) {
          const filteredRooms = this.allRooms.filter(
            (room: Room) =>
              room.room_code.toLowerCase().includes(term) ||
              room.building?.building_name.toLowerCase().includes(term) ||
              room.room_type.toLowerCase().includes(term) ||
              room.floor_level.toLowerCase().includes(term) ||
              room.status.toLowerCase().includes(term) ||
              room.capacity.toString().includes(term)
          );
          this.roomsSubject.next(filteredRooms);
        } else {
          this.roomsSubject.next(this.allRooms);
        }
      });
  }

  getFloorLevels(buildingId: number): Observable<number[]> {
    return this.roomService.getFloorLevels(buildingId);
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.searchControl.setValue(values['search']);
    }
  }

  getDialogConfig(room?: Room): DialogConfig {
    const buildings = this.buildingsSubject.value;
    const buildingId = room?.building_id;
    let floorLevels: string[] = [];

    if (buildingId) {
      const building = buildings.find((b) => b.building_id === buildingId);
      if (building) {
        floorLevels = Array.from({ length: building.floor_levels }, (_, i) => {
          const num = i + 1;
          return `${num}${this.getOrdinalSuffix(num)}`;
        });
      }
    }

    const buildingOptions: SelectOption[] = buildings.map((b) => ({
      value: b.building_id.toString(),
      label: b.building_name,
      metadata: {
        floor_levels: b.floor_levels.toString(),
      },
    }));

    const floorLevelOptions: SelectOption[] = floorLevels.map((level) => ({
      value: level,
      label: `${level} Floor`,
    }));

    const roomTypeOptions: SelectOption[] = this.roomTypes.map((type) => ({
      value: type,
      label: type,
    }));

    const statusOptions: SelectOption[] = ['Available', 'Unavailable'].map(
      (status) => ({
        value: status,
        label: status,
      })
    );

    return {
      title: room ? 'Edit Room' : 'Add Room',
      isEdit: !!room,
      initialValue: room
        ? {
            room_code: room.room_code,
            building_id: room.building_id.toString(),
            floor_level: room.floor_level,
            room_type: room.room_type,
            capacity: room.capacity,
            status: room.status,
          }
        : undefined,
      fields: [
        {
          label: 'Room Code',
          formControlName: 'room_code',
          type: 'text',
          required: true,
          maxLength: 191,
        },
        {
          label: 'Building',
          formControlName: 'building_id',
          type: 'select',
          required: true,
          options: buildingOptions,
        },
        {
          label: 'Floor Level',
          formControlName: 'floor_level',
          type: 'select',
          required: true,
          options: floorLevelOptions,
        },
        {
          label: 'Room Type',
          formControlName: 'room_type',
          type: 'select',
          required: true,
          options: roomTypeOptions,
        },
        {
          label: 'Capacity',
          formControlName: 'capacity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          label: 'Status',
          formControlName: 'status',
          type: 'select',
          required: true,
          options: statusOptions,
        },
      ],
    };
  }

  private getOrdinalSuffix(num: number): string {
    const j = num % 10;
    const k = num % 100;
    if (j == 1 && k != 11) return 'st';
    if (j == 2 && k != 12) return 'nd';
    if (j == 3 && k != 13) return 'rd';
    return 'th';
  }

  openAddRoomDialog() {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: this.getDialogConfig(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.roomService
          .addRoom(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Room added successfully', 'Close', {
                duration: 3000,
              });
              this.fetchRooms();
            },
            error: (error) => {
              console.error('Error adding room:', error);
              this.snackBar.open('Error adding room', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  openEditRoomDialog(room: Room) {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: this.getDialogConfig(room),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.roomService
          .updateRoom(room.room_id!, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Room updated successfully', 'Close', {
                duration: 3000,
              });
              this.fetchRooms();
            },
            error: (error) => {
              console.error('Error updating room:', error);
              this.snackBar.open('Error updating room', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  deleteRoom(room: Room) {
    this.roomService
      .deleteRoom(room.room_id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Room deleted successfully', 'Close', {
            duration: 3000,
          });
          this.fetchRooms();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Error deleting room';
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
      doc.text('Room Report', pageWidth / 2, currentY, { align: 'center' });
      currentY += 8;

      // Add the horizontal line below the header
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 7; // Move down after the header and line

      const rooms = this.roomsSubject.getValue();
      const bodyData = rooms.map((room, index) => [
        (index + 1).toString(),
        room.room_code,
        room.building?.building_name,
        room.floor_level,
        room.room_type,
        room.capacity.toString(),
        room.status,
      ]);

      // Add table to PDF
      (doc as any).autoTable({
        startY: currentY,
        head: [
          [
            '#',
            'Room Code',
            'Location',
            'Floor Level',
            'Room Type',
            'Capacity',
            'Status',
          ],
        ],
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
          0: { cellWidth: 15 }, // # (index)
          1: { cellWidth: 30 }, // Room Code
          2: { cellWidth: 40 }, // Location
          3: { cellWidth: 30 }, // Floor Level
          4: { cellWidth: 40 }, // Room Type
          5: { cellWidth: 20 }, // Capacity
          6: { cellWidth: 25 }, // Status
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
        entity: 'Rooms',
        customTitle: 'Export All Rooms',
        generatePdfFunction: (showPreview: boolean) => {
          return this.createPdfBlob();
        },
        generateFileNameFunction: () => 'pup_taguig_rooms_report.pdf',
      },
    });
  }
}
