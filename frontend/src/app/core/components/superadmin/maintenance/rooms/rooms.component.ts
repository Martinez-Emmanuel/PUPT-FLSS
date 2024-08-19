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

import { TableGenericComponent } from '../../../../../shared/table-generic/table-generic.component';
import { TableHeaderComponent } from '../../../../../shared/table-header/table-header.component';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RoomService, Room } from '../../../../services/room/room.service';
  TableDialogComponent,
  DialogConfig,
} from '../../../../../shared/table-dialog/table-dialog.component';

import {
  Room,
  RoomService,
} from '../../../../services/superadmin/rooms/rooms.service';

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

  dataSource = new MatTableDataSource<Room>([]);
  addRoomForm!: FormGroup;
  isEdit = false;
  selectedRoom: Room| null = null;

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

  loadRooms(): void {
    this.roomService.getRooms().subscribe({
      next: (rooms) => {
        this.dataSource.data = rooms;
        this.cd.markForCheck(); // Ensure change detection
      },
      error: (err) => {
        this.snackBar.open('Error loading rooms', 'Close', { duration: 2000 });
      },
    });
  }
  
  openAddRoomDialog(): void {
    this.isEdit = false;
    this.addRoomForm.reset();
    this.dialog.open(this.addEditRoomDialog, {
      width: '250px',
    });
  }

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