import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';

import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent,InputField } from '../../../../../shared/table-header/table-header.component';
import { TableDialogComponent, DialogConfig } from '../../../../../shared/table-dialog/table-dialog.component';

import { Room, RoomService } from '../../../../services/superadmin/rooms/rooms.service';

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
    { key: 'floor', label: 'Floor Level' },
    { key: 'room_type', label: 'Room Type' },
    { key: 'capacity', label: 'Capacity' },
  ];

  displayedColumns: string[] = [
    'index',
    'room_code',
    'location',
    'floor',
    'room_type',
    'capacity',
  ];

  headerInputFields: InputField[] = [
    {
      type: 'text',
      label: 'Search Rooms',
      key: 'search'
    }
  ];

  constructor(
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
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

  onExport() {
    console.log('Export functionality not implemented yet');
  }


  private getDialogConfig(room?: Room): DialogConfig {
    return {
      title: 'Room',
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
          formControlName: 'floor',
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
        this.roomService.addRoom(result).subscribe((rooms) => {
          this.rooms = rooms;
          this.snackBar.open('Room added successfully', 'Close', {
            duration: 3000,
          });
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
        this.updateRoom(result);
      }
    });
  }

  closeDialog(): void {
    this.dialog.closeAll();
  }

  addRoom(): void {
    if (this.addRoomForm.valid) {
      const newRoom: Room = this.addRoomForm.value;
      this.roomService.addRoom(newRoom).subscribe({
        next: ( ) => {
          this.closeDialog();
          this.snackBar.open('Room added successfully', 'Close', {
            duration: 2000,
          });
          this.loadRooms();
        },
        error: (err) => {
          this.snackBar.open('Error adding room', 'Close', { duration: 2000 });
        },
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 2000,
      });
    }
  }

  updateRoom(): void {
    if (this.addRoomForm.valid && this.selectedRoom) {
      const updatedRoom: Room = { ...this.addRoomForm.value, room_id: this.selectedRoom.room_id };
  
      this.roomService.updateRoom(updatedRoom).subscribe({
        next: () => {
          this.snackBar.open('Room updated successfully', 'Close', {
            duration: 2000,
          });
          this.closeDialog();
          this.loadRooms();
        },
        error: (err) => {
          this.snackBar.open('Error updating room', 'Close', { duration: 2000 });
        },
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 2000,
      });
    }
  }

  deleteRoom(room: Room): void {
    this.roomService.deleteRoom(room.room_id!).subscribe({
      next: () => {
        this.dataSource.data = this.dataSource.data.filter((r) => r.room_id !== room.room_id);
        this.snackBar.open('Room deleted successfully', 'Close', {
          duration: 2000,
        });
      },
      error: (err) => {
        this.snackBar.open('Error deleting room', 'Close', { duration: 2000 });
      },
    });
  }
}