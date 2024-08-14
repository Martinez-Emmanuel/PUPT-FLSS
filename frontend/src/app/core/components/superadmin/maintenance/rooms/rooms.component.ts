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

interface Room {
  room_code: string;
  location: string;
  room_type: string;
  capacity: number;
}

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
  selectedRoom: Room | null = null;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
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
    const rooms: Room[] = [
      {
        room_code: 'A201',
        location: 'Building A',
        room_type: 'Lecture',
        capacity: 50,
      },
      {
        room_code: 'A202',
        location: 'Building A',
        room_type: 'Lecture',
        capacity: 50,
      },
      {
        room_code: 'A203',
        location: 'Building A',
        room_type: 'Lecture',
        capacity: 50,
      },
      {
        room_code: 'A204',
        location: 'Building A',
        room_type: 'Lecture',
        capacity: 50,
      },
      {
        room_code: 'A205',
        location: 'Building A',
        room_type: 'Lecture',
        capacity: 50,
      },
      {
        room_code: 'DOSTLAB',
        location: 'Building A',
        room_type: 'Lab',
        capacity: 60,
      },
      {
        room_code: 'ABOITIZLAB',
        location: 'Building A',
        room_type: 'Lab',
        capacity: 60,
      },
      {
        room_code: 'B302',
        location: 'Building B',
        room_type: 'Lab',
        capacity: 30,
      },
      {
        room_code: 'B303',
        location: 'Building B',
        room_type: 'Lab',
        capacity: 30,
      },
      {
        room_code: 'B304',
        location: 'Building B',
        room_type: 'Lab',
        capacity: 30,
      },
      {
        room_code: 'B305',
        location: 'Building B',
        room_type: 'Lab',
        capacity: 30,
      },
      {
        room_code: 'B306',
        location: 'Building B',
        room_type: 'Lab',
        capacity: 30,
      },
      {
        room_code: 'C101',
        location: 'Building C',
        room_type: 'Lecture',
        capacity: 100,
      },
      {
        room_code: 'ENG101',
        location: 'Engineering Building',
        room_type: 'Lecture',
        capacity: 50,
      },
      {
        room_code: 'ENG102',
        location: 'Engineering Building',
        room_type: 'Lab',
        capacity: 60,
      },
      {
        room_code: 'ENG103',
        location: 'Engineering Building',
        room_type: 'Lecture',
        capacity: 50,
      },
      {
        room_code: 'ENG104',
        location: 'Engineering Building',
        room_type: 'Lab',
        capacity: 60,
      },
      {
        room_code: 'ENG105',
        location: 'Engineering Building',
        room_type: 'Lecture',
        capacity: 50,
      },
    ];    
    this.dataSource.data = rooms;
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
      this.dataSource.data = [...this.dataSource.data, newRoom];
      this.closeDialog();
      this.snackBar.open('Room added successfully', 'Close', {
        duration: 2000,
      });
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 2000,
      });
    }
  }

  updateRoom(): void {
    if (this.addRoomForm.valid && this.selectedRoom) {
      const updatedRoom: Room = this.addRoomForm.value;
      const index = this.dataSource.data.indexOf(this.selectedRoom);
      if (index > -1) {
        this.dataSource.data[index] = updatedRoom;
        this.dataSource.data = [...this.dataSource.data];
        this.closeDialog();
        this.snackBar.open('Room updated successfully', 'Close', {
          duration: 2000,
        });
      }
    } else {
      this.snackBar.open('Please fill in all required fields', 'Close', {
        duration: 2000,
      });
    }
  }

  deleteRoom(room: Room): void {
    const index = this.dataSource.data.indexOf(room);
    if (index > -1) {
      this.dataSource.data.splice(index, 1);
      this.dataSource.data = [...this.dataSource.data];
      this.snackBar.open('Room deleted successfully', 'Close', {
        duration: 2000,
      });
    }
  }
}
