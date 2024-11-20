import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, catchError, map, finalize } from 'rxjs/operators';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../shared/loading/loading.component';
import { DialogExportComponent } from '../../../../../shared/dialog-export/dialog-export.component';

import { Room, RoomService } from '../../../../services/superadmin/rooms/rooms.service';

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
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoomsComponent implements OnInit, OnDestroy {
  roomTypes = ['Lecture', 'Laboratory', 'Office'];
  floors = ['1st', '2nd', '3rd', '4th', '5th'];
  selectedRoomIndex: number | null = null;

  private roomsSubject = new BehaviorSubject<Room[]>([]);
  rooms$ = this.roomsSubject.asObservable();

  columns = [
    { key: 'index', label: '#' },
    { key: 'room_code', label: 'Room Code' },
    { key: 'location', label: 'Location' },
    { key: 'floor_level', label: 'Floor Level' },
    { key: 'room_type', label: 'Room Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'status', label: 'Status' },
  ];

  displayedColumns: string[] = [
    'index',
    'room_code',
    'location',
    'floor_level',
    'room_type',
    'capacity',
    'status',
  ];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Rooms',
      key: 'search',
    },
  ];

  isLoading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.fetchRooms();
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
        catchError((err) => {
          this.snackBar.open('Error fetching rooms data', 'Close', {
            duration: 3000,
          });
          return [];
        }),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((rooms) => {
        this.roomsSubject.next(rooms);
      });
  }

  onInputChange(values: { [key: string]: any }) {
    if (values['search'] !== undefined) {
      this.onSearch(values['search']);
    }
  }

  onSearch(searchTerm: string) {
    this.roomService
      .getRooms()
      .pipe(
        map((rooms) =>
          rooms.filter(
            (room) =>
              room.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
              room.location.toLowerCase().includes(searchTerm.toLowerCase())
          )
        ),
        catchError(() => {
          this.snackBar.open('Error during search', 'Close', {
            duration: 3000,
          });
          return [];
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((filteredRooms) => {
        this.roomsSubject.next(filteredRooms);
        this.cdr.markForCheck();
      });
  }

  getDialogConfig(room?: Room): DialogConfig {
    return {
      title: room ? 'Edit Room' : 'Add Room',
      isEdit: !!room,
      fields: [
        {
          label: 'Room Code',
          formControlName: 'room_code',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'Location',
          formControlName: 'location',
          type: 'text',
          maxLength: 50,
          required: true,
        },
        {
          label: 'Floor Level',
          formControlName: 'floor_level',
          type: 'select',
          options: this.floors,
          required: true,
        },
        {
          label: 'Room Type',
          formControlName: 'room_type',
          type: 'select',
          options: this.roomTypes,
          required: true,
        },
        {
          label: 'Capacity',
          formControlName: 'capacity',
          type: 'number',
          min: 1,
          max: 999,
          required: true,
        },
        {
          label: 'Status',
          formControlName: 'status',
          type: 'select',
          options: ['Available', 'Unavailable'],
          required: true,
        },
      ],
      initialValue: room || {},
    };
  }

  // ======================
  // CRU Operations
  // ======================

  openAddRoomDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.roomService
            .addRoom(result)
            .pipe(
              catchError(() => {
                this.snackBar.open('Error adding room', 'Close', {
                  duration: 3000,
                });
                return [];
              }),
              takeUntil(this.destroy$)
            )
            .subscribe((newRoom) => {
              const currentRooms = this.roomsSubject.getValue();
              this.roomsSubject.next([...currentRooms, newRoom]);
              this.snackBar.open(
                `Room ${newRoom.room_code} added successfully.`,
                'Close',
                {
                  duration: 3000,
                }
              );
            });
        }
      });
  }

  openEditRoomDialog(room: Room) {
    const config = this.getDialogConfig(room);
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          const updatedRoom = { ...result, room_id: room.room_id };
          this.updateRoom(updatedRoom);
        }
      });
  }

  updateRoom(room: Room) {
    const roomId = room.room_id;
    if (roomId !== undefined) {
      this.roomService
        .updateRoom(roomId, room)
        .pipe(
          catchError(() => {
            this.snackBar.open('Error updating room.', 'Close', {
              duration: 3000,
            });
            return [];
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((updated) => {
          const currentRooms = this.roomsSubject.getValue();
          const index = currentRooms.findIndex((r) => r.room_id === roomId);
          if (index !== -1) {
            currentRooms[index] = updated;
            this.roomsSubject.next([...currentRooms]);
            this.snackBar.open(
              `Room ${updated.room_code} updated successfully.`,
              'Close',
              {
                duration: 3000,
              }
            );
          }
        });
    }
  }

  deleteRoom(room: Room) {
    const roomId = room.room_id;
    if (roomId !== undefined) {
      this.roomService
        .deleteRoom(roomId)
        .pipe(
          catchError((error) => {
            const errorMessage = error.error?.message || 'Error deleting room.';
            this.snackBar.open(errorMessage, 'Close', {
              duration: 3000,
            });
            return [];
          }),
          takeUntil(this.destroy$)
        )
        .subscribe((response) => {
          if (response.success) {
            const updatedRooms = this.roomsSubject
              .getValue()
              .filter((r) => r.room_id !== roomId);
            this.roomsSubject.next(updatedRooms);
            this.snackBar.open(
              `Room ${room.room_code} deleted successfully.`,
              'Close',
              {
                duration: 3000,
              }
            );
          }
        });
    }
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
        room.location,
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
