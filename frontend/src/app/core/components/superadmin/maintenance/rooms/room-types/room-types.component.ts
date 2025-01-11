import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, finalize, debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { TableGenericComponent } from '../../../../../../shared/table-generic/table-generic.component';
import { TableDialogComponent, DialogConfig } from '../../../../../../shared/table-dialog/table-dialog.component';
import { TableHeaderComponent, InputField } from '../../../../../../shared/table-header/table-header.component';
import { LoadingComponent } from '../../../../../../shared/loading/loading.component';

import { RoomType, RoomTypesService } from '../../../../../services/superadmin/room-types/room-types.service';

import { fadeAnimation } from '../../../../../animations/animations';

@Component({
  selector: 'app-room-types',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableGenericComponent,
    TableHeaderComponent,
    LoadingComponent,
    MatDialogModule,
    MatSnackBarModule,
  ],
  providers: [MatDialog],
  templateUrl: './room-types.component.html',
  styleUrls: ['./room-types.component.scss'],
  animations: [fadeAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomTypesComponent implements OnInit, OnDestroy {
  private roomTypesSubject = new BehaviorSubject<RoomType[]>([]);
  roomTypes$ = this.roomTypesSubject.asObservable();
  private allRoomTypes: RoomType[] = [];

  columns = [
    { key: 'index', label: '#' },
    { key: 'type_name', label: 'Room Type' },
    { key: 'created_at', label: 'Created At' },
    { key: 'updated_at', label: 'Updated At' },
    { key: 'actions', label: 'Actions' },
  ];

  displayedColumns = ['index', 'type_name', 'created_at', 'updated_at'];

  headerInputFields: InputField[] = [
    { key: 'search', label: 'Search Room Types', type: 'text' },
  ];

  isLoading = true;
  searchControl = new FormControl('');
  private destroy$ = new Subject<void>();

  constructor(
    private roomTypesService: RoomTypesService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.fetchRoomTypes();
    this.setupSearch();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  fetchRoomTypes() {
    this.isLoading = true;
    this.roomTypesService
      .getRoomTypes()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (roomTypes) => {
          this.allRoomTypes = roomTypes;
          this.roomTypesSubject.next(roomTypes);
        },
        error: (error: unknown) => {
          console.error('Error fetching room types:', error);
          this.snackBar.open('Error fetching room types', 'Close', {
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
          this.roomTypesSubject.next(this.allRoomTypes);
          return;
        }

        const filteredRoomTypes = this.allRoomTypes.filter((roomType) =>
          roomType.type_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.roomTypesSubject.next(filteredRoomTypes);
      });
  }

  onInputChange(values: { [key: string]: any }) {
    this.searchControl.setValue(values['search'] || '');
  }

  getDialogConfig(roomType?: RoomType): DialogConfig {
    const initialValue = roomType
      ? {
          type_name: roomType.type_name,
        }
      : undefined;

    return {
      title: roomType ? 'Edit Room Type' : 'Add Room Type',
      fields: [
        {
          formControlName: 'type_name',
          label: 'Room Type Name',
          type: 'text',
          required: true,
          maxLength: 191,
        },
      ],
      isEdit: !!roomType,
      initialValue,
    };
  }

  openAddRoomTypeDialog() {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: this.getDialogConfig(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.roomTypesService
          .createRoomType(result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Room type added successfully', 'Close', {
                duration: 3000,
              });
              this.fetchRoomTypes();
            },
            error: (error: unknown) => {
              console.error('Error adding room type:', error);
              this.snackBar.open('Error adding room type', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  openEditRoomTypeDialog(roomType: RoomType) {
    const dialogRef = this.dialog.open(TableDialogComponent, {
      data: this.getDialogConfig(roomType),
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.roomTypesService
          .updateRoomType(roomType.room_type_id, result)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.snackBar.open('Room type updated successfully', 'Close', {
                duration: 3000,
              });
              this.fetchRoomTypes();
            },
            error: (error: unknown) => {
              console.error('Error updating room type:', error);
              this.snackBar.open('Error updating room type', 'Close', {
                duration: 3000,
              });
            },
          });
      }
    });
  }

  deleteRoomType(roomType: RoomType) {
    this.roomTypesService
      .deleteRoomType(roomType.room_type_id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.snackBar.open('Room type deleted successfully', 'Close', {
            duration: 3000,
          });
          this.fetchRoomTypes();
        },
        error: (error: Error) => {
          console.error('Error deleting room type:', error);
          this.snackBar.open(error.message, 'Close', {
            duration: 3000,
          });
        },
      });
  }
}