import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent, InputField } from '../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';
import { fadeAnimation } from '../../../../animations/animations';
import { Room, RoomService } from '../../../../services/superadmin/rooms/rooms.service';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomsComponent implements OnInit {
  roomTypes = ['Lecture', 'Laboratory', 'Office'];
  floors = ['1st', '2nd', '3rd', '4th', '5th'];
  selectedRoomIndex: number | null = null;

  rooms: Room[] = [];
  columns = [
    { key: 'index', label: '#' },
    { key: 'room_code', label: 'Room Code' },
    { key: 'location', label: 'Location' },
    { key: 'floor_level', label: 'Floor Level' },
    { key: 'room_type', label: 'Room Type' },
    { key: 'capacity', label: 'Capacity' },
    { key: 'status', label: 'Status'},
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
      key: 'search'
    }
  ];

  showPreview = false;  

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private roomService: RoomService
  ) {}

  ngOnInit() {
    this.fetchRooms();
  }

  fetchRooms() {
    this.roomService.getRooms().subscribe((rooms) => {
      this.rooms = rooms;
      this.cdr.markForCheck();
    });
  }

  onInputChange(values: {[key: string]: any}) {
    if (values['search'] !== undefined) {
      this.onSearch(values['search']);
    }
  }

  private onSearch(searchTerm: string) {
    this.roomService.getRooms().subscribe((rooms) => {
      this.rooms = rooms.filter(
        (room) =>
          room.room_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          room.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      this.cdr.markForCheck();
    });
  }

  public generatePDF(showPreview: boolean = false): void {
    const doc = new jsPDF('p', 'mm', 'legal') as any;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 10;
    const logoSize = 22;
    const topMargin = 15;
    let currentY = topMargin;

    // Add the left logo
    const leftLogoUrl = 'https://iantuquib.weebly.com/uploads/5/9/7/7/59776029/2881282_orig.png'; 
    doc.addImage(leftLogoUrl, 'PNG', margin, 10, logoSize, logoSize); 

    // Add the header text with different styles
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text('POLYTECHNIC UNIVERSITY OF THE PHILIPPINES – TAGUIG BRANCH', pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;

    doc.setFontSize(12);
    doc.text('Gen. Santos Ave. Upper Bicutan, Taguig City', pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;

    doc.setFontSize(15);
    // doc.setFont('times', 'italic');
    doc.setTextColor(0, 0, 0);
    doc.text('Room Report', pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;

    // Add the horizontal line below the header
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(margin, currentY, pageWidth - margin, currentY);

    currentY += 7; // Move down after the header and line

    const bodyData = this.rooms.map((room, index) => [
        (index + 1).toString(),
        room.room_code,
        room.location,
        room.floor_level,
        room.room_type,
        room.capacity.toString(),
        room.status,
    ]);

    doc.autoTable({
        startY: currentY,
        head: [['#', 'Room Code', 'Location', 'Floor Level', 'Room Type', 'Capacity', 'Status']],
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
            0: { cellWidth: 15 },  // # (index)
            1: { cellWidth: 30 },  // Room Code
            2: { cellWidth: 40 },  // Location
            3: { cellWidth: 30 },  // Floor Level
            4: { cellWidth: 40 },  // Room Type
            5: { cellWidth: 20 },  // Capacity
            6: { cellWidth: 25 },  // Status
        },
        margin: { left: margin, right: margin },
        didDrawPage: (data: any) => {
            currentY = data.cursor.y + 10;
        },
    });

    // Create the blob and generate the URL before setting the iframe source
    const pdfBlob = doc.output('blob');
    const blobUrl = URL.createObjectURL(pdfBlob);

    if (showPreview) {
        this.showPreview = true; 
        setTimeout(() => {
            const iframe = document.getElementById('pdfPreview') as HTMLIFrameElement;

            if (iframe) {
                iframe.src = blobUrl;
            }
        }, 0); 
    } else {
        doc.save('rooms_report.pdf');
    }
  }

  onExport() {
    this.generatePDF(true);  // Trigger PDF generation with preview
  }

  cancelPreview() {
    this.showPreview = false;  // Hide the preview section
  }

  private getDialogConfig(room?: Room): DialogConfig {
    return {
      title: room ? 'Edit Room' : 'Add Room',
      isEdit: !!room,
      fields: [
        {
          label: 'Room Code',
          formControlName: 'room_code',
          type: 'text',
          maxLength: 15,
          required: true,
        },
        {
          label: 'Location',
          formControlName: 'location',
          type: 'text',
          maxLength: 25,
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
          options: ['Active', 'Inactive'],
          required: true,
        },
      ],
      initialValue: room || {},
    };
  }

  openAddRoomDialog() {
    const config = this.getDialogConfig();
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.roomService.addRoom(result).subscribe((newRoom) => {
          this.rooms.push(newRoom);
          this.snackBar.open('Room added successfully', 'Close', {
            duration: 3000,
          });
          this.fetchRooms();
          this.cdr.markForCheck();
        });
      }
    });
  }

  openEditRoomDialog(room: Room) {
    this.selectedRoomIndex = this.rooms.indexOf(room);
    const config = this.getDialogConfig(room);

    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: config,
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result && this.selectedRoomIndex !== null) {
        if (!result.room_id) {
            result.room_id = room.room_id;
        }
        this.updateRoom(result);
    } else {
        console.error('Dialog result is null or no room selected');
    }
  });
  }

  updateRoom(room: Room) {
    const roomId = room.room_id;

    if (roomId !== undefined) {

      this.roomService.updateRoom(roomId, room).subscribe((updated) => {
        const index = this.rooms.findIndex(r => r.room_id === roomId);
          if (index >= 0) {
            this.rooms[index] = updated;
                this.snackBar.open('Room updated successfully', 'Close', {
                    duration: 3000,
                });
              this.fetchRooms();
              this.cdr.markForCheck();
            }
      });
    }
  }

  deleteRoom(room: Room) {
    const roomId = room.room_id;
    if (roomId !== undefined) {
      this.roomService.deleteRoom(roomId).subscribe(() => {
        const index = this.rooms.findIndex(r => r.room_id === roomId);
        if (index >= 0) {
          this.rooms.splice(index, 1);
          this.snackBar.open('Room deleted successfully', 'Close', {
            duration: 3000,
          });
          this.fetchRooms();
          this.cdr.markForCheck();
        }
      });
    }
  }  
}
