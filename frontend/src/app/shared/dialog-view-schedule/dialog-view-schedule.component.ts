import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { LoadingComponent } from '../loading/loading.component';

import { fadeAnimation } from '../../core/animations/animations';

interface ViewScheduleDialogData {
  entity: string;
  entityData?: any;
  customTitle?: string;
  academicYear?: string;
  semester?: number;
}

@Component({
  selector: 'app-dialog-view-schedule',
  standalone: true,
  imports: [
    CommonModule,
    LoadingComponent,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './dialog-view-schedule.component.html',
  styleUrl: './dialog-view-schedule.component.scss',
  animations: [fadeAnimation],
})
export class DialogViewScheduleComponent implements OnInit {
  title: string = '';
  subtitle: string = '';
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<DialogViewScheduleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ViewScheduleDialogData
  ) {}

  ngOnInit(): void {
    this.initializeScheduleTitle();
  }

  private initializeScheduleTitle(): void {
    this.setTitleAndSubtitle();
  }

  private setTitleAndSubtitle(): void {
    const { customTitle, entityData, academicYear, semester } = this.data;

    this.title = customTitle ?? entityData?.name ?? entityData?.title;
    this.subtitle =
      academicYear && semester
        ? `For Academic Year ${academicYear}, ${semester}`
        : '';
    this.isLoading = false;
  }

  public closeDialog(): void {
    this.dialogRef.close();
  }
}
