import {
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { BehaviorSubject, Subject, Observable, combineLatest } from 'rxjs';
import {
  takeUntil,
  map,
  finalize,
  debounceTime,
  distinctUntilChanged,
  switchMap,
} from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import {
  TableDialogComponent,
  DialogConfig,
  SelectOption,
} from '../../../../../shared/table-dialog/table-dialog.component';
import {
  TableHeaderComponent,
  InputField,
} from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogExportComponent } from '../../../../../shared/dialog-export/dialog-export.component';

import {
  RoomWithDetails,
  RoomService,
} from '../../../../services/superadmin/rooms/rooms.service';
import {
  Building,
  BuildingsService,
} from '../../../../services/superadmin/buildings/buildings.service';
import {
  RoomType,
  RoomTypesService,
} from '../../../../services/superadmin/room-types/room-types.service';

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
  private roomsSubject = new BehaviorSubject<RoomWithDetails[]>([]);
  rooms$ = this.roomsSubject.asObservable();
  private allRooms: RoomWithDetails[] = [];

  private buildingsSubject = new BehaviorSubject<Building[]>([]);
  buildings$ = this.buildingsSubject.asObservable();

  private roomTypesSubject = new BehaviorSubject<RoomType[]>([]);
  roomTypes$ = this.roomTypesSubject.asObservable();

  columns = [
    { key: 'index', label: '#' },
    { key: 'room_code', label: 'Room Code' },
    { key: 'building_name', label: 'Building' },
    { key: 'floor_level', label: 'Floor Level' },
    { key: 'room_type_name', label: 'Room Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'status', label: 'Status' },
    { key: 'actions', label: 'Actions' },
  ];

  displayedColumns = [
    'index',
    'room_code',
    'building_name',
    'floor_level',
    'room_type_name',
    'capacity',
    'status',
  ];

  headerInputFields: InputField[] = [
    { key: 'search', label: 'Search Rooms', type: 'text' },
  ];

  isLoading = true;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private roomService: RoomService,
    private buildingsService: BuildingsService,
    private roomTypesService: RoomTypesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchInitialData();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private fetchInitialData() {
    this.isLoading = true;

    combineLatest([
      this.buildingsService.getBuildings(),
      this.roomTypesService.getRoomTypes(),
    ])
      .pipe(
        takeUntil(this.destroy$),
        switchMap(([buildings, roomTypes]) => {
          this.buildingsSubject.next(buildings);
          this.roomTypesSubject.next(roomTypes);

          return this.roomService.getRooms().pipe(
            map((rooms) =>
              rooms.map(
                (room): RoomWithDetails => ({
                  ...room,
                  building_name:
                    buildings.find((b) => b.building_id === room.building_id)
                      ?.building_name || '',
                  room_type_name:
                    roomTypes.find(
                      (rt) => rt.room_type_id === room.room_type_id
                    )?.type_name || '',
                })
              )
            )
          );
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
          console.error('Error fetching data:', error);
          this.snackBar.open('Error fetching data', 'Close', {
            duration: 3000,
          });
        },
      });
  }

  setupSearch() {
    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((searchTerm) => {
        if (!searchTerm) {
          this.roomsSubject.next(this.allRooms);
          return;
        }

        const term = searchTerm.toLowerCase();
        const filteredRooms = this.allRooms.filter(
          (room) =>
            room.room_code.toLowerCase().includes(term) ||
            room.building_name.toLowerCase().includes(term) ||
            room.room_type_name.toLowerCase().includes(term) ||
            room.floor_level.toLowerCase().includes(term) ||
            room.status.toLowerCase().includes(term) ||
            room.capacity.toString().includes(term)
        );
        this.roomsSubject.next(filteredRooms);
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

  getDialogConfig(room?: RoomWithDetails): DialogConfig {
    const buildings = this.buildingsSubject.value;
    const roomTypes = this.roomTypesSubject.value;
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

    const roomTypeOptions: SelectOption[] = [
      {
        value: 'configure',
        label: 'Click to configure room types...',
        metadata: {
          isConfig: true,
          icon: 'settings',
        },
      },
      ...roomTypes.map((rt) => ({
        value: rt.room_type_id.toString(),
        label: rt.type_name,
      })),
    ];

    return {
      title: room ? 'Edit Room' : 'Add Room',
      fields: [
        {
          formControlName: 'room_code',
          label: 'Room Code',
          type: 'text',
          required: true,
          maxLength: 191,
        },
        {
          formControlName: 'building_id',
          label: 'Building',
          type: 'select',
          required: true,
          options: buildingOptions,
        },
        {
          formControlName: 'floor_level',
          label: 'Floor Level',
          type: 'select',
          required: true,
          options: floorLevelOptions,
        },
        {
          formControlName: 'room_type_id',
          label: 'Room Type',
          type: 'select',
          required: true,
          options: roomTypeOptions,
        },
        {
          formControlName: 'capacity',
          label: 'Capacity',
          type: 'number',
          required: true,
          min: 1,
        },
        {
          formControlName: 'status',
          label: 'Status',
          type: 'select',
          required: true,
          options: [
            { value: 'Available', label: 'Available' },
            { value: 'Unavailable', label: 'Unavailable' },
          ],
        },
      ],
      isEdit: !!room,
      initialValue: room
        ? {
            room_code: room.room_code,
            building_id: room.building_id.toString(),
            floor_level: room.floor_level,
            room_type_id: room.room_type_id.toString(),
            capacity: room.capacity.toString(),
            status: room.status,
          }
        : undefined,
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
              this.fetchInitialData();
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

  openEditRoomDialog(room: RoomWithDetails) {
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
              this.fetchInitialData();
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

  deleteRoom(room: RoomWithDetails) {
    this.roomService
      .deleteRoom(room.room_id!)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Room deleted successfully', 'Close', {
            duration: 3000,
          });
          this.fetchInitialData();
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
      // Helper function to add header
      const addHeader = (title: string) => {
        currentY = topMargin;
        
        // Add the university logo
        const leftLogoUrl = 'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png';
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
        doc.text(title, pageWidth / 2, currentY, { align: 'center' });
        currentY += 8;
  
        // Add the horizontal line below the header
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.5);
        doc.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 7;
      };
  
      // Helper function to add table
      const addTable = (data: any[], startY: number) => {
        if (data.length === 0) {
          // If no data, add a message
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.setFont('times', 'italic');
          doc.text(
            'No available rooms found.', 
            pageWidth / 2, startY + 10, { align: 'center' }
          );
          doc.setFont('times', 'normal');
          return;
        }
  
        (doc as any).autoTable({
          startY: startY,
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
          body: data,
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
            0: { cellWidth: 15 },
            1: { cellWidth: 30 },
            2: { cellWidth: 40 },
            3: { cellWidth: 25 },
            4: { cellWidth: 40 },
            5: { cellWidth: 20 },
            6: { cellWidth: 25 },
          },
          margin: { left: margin, right: margin },
        });
      };
  
      // Get all rooms and buildings
      const allRooms = this.roomsSubject.getValue();
      // Filter out unavailable rooms
      const rooms = allRooms.filter(room => room.status === 'Available');
      const buildings = this.buildingsSubject.getValue();
  
      // First page: All available rooms
      addHeader('Room Report - All Rooms');
      const allRoomsData = rooms.map((room, index) => [
        (index + 1).toString(),
        room.room_code,
        room.building_name,
        room.floor_level,
        room.room_type_name,
        room.capacity.toString(),
        room.status,
      ]);
      addTable(allRoomsData, currentY);
  
      // Subsequent pages: Available rooms by building
      buildings.forEach((building) => {
        // Add new page for each building
        doc.addPage();
  
        // Add header for building page
        addHeader(`Room Report - ${building.building_name}`);
  
        // Filter available rooms for this building
        const buildingRooms = rooms
          .filter(room => room.building_id === building.building_id)
          .map((room, index) => [
            (index + 1).toString(),
            room.room_code,
            room.building_name,
            room.floor_level,
            room.room_type_name,
            room.capacity.toString(),
            room.status,
          ]);
  
        // Add table for building rooms
        addTable(buildingRooms, currentY);
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
