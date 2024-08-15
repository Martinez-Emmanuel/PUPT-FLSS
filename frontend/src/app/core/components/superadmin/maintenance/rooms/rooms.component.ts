import {
  Component,
  OnInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { MaterialComponents } from '../../../../imports/material.component';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSymbolDirective } from '../../../../imports/mat-symbol.directive';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { RoomService, Room } from '../../../../services/room/room.service';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    MaterialComponents,
    CommonModule,
    MatSymbolDirective,
    ReactiveFormsModule,
  ],
  templateUrl: './rooms.component.html',
  styleUrls: ['./rooms.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomsComponent implements OnInit {
  @ViewChild('addEditRoomDialog') addEditRoomDialog!: TemplateRef<any>;

  displayedColumns: string[] = [
    'num',
    'room_code',
    'location',
    'room_type',
    'capacity',
    'action',
  ];

  dataSource = new MatTableDataSource<Room>([]);
  addRoomForm!: FormGroup;
  isEdit = false;
  selectedRoom: Room| null = null;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef,
    private roomService: RoomService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadRooms();
  }

  initializeForm(): void {
    this.addRoomForm = this.fb.group({
      room_code: ['', Validators.required],
      location: ['', Validators.required],
      room_type: ['', Validators.required],
      capacity: [0, Validators.required],
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

  openEditRoomDialog(room: Room): void {
    this.isEdit = true;
    this.selectedRoom = room;
    this.addRoomForm.patchValue(room);
    this.dialog.open(this.addEditRoomDialog, {
      width: '250px',
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