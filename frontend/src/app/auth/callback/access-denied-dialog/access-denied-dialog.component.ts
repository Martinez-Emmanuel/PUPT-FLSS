import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSymbolDirective } from '../../../core/imports/mat-symbol.directive';

@Component({
  selector: 'app-access-denied-dialog',
  templateUrl: './access-denied-dialog.component.html',
  styleUrls: ['./access-denied-dialog.component.scss'],
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatSymbolDirective],
})
export class AccessDeniedDialogComponent {
  constructor(public dialogRef: MatDialogRef<AccessDeniedDialogComponent>) {}

  onRetry(): void {
    this.dialogRef.close('retry');
  }

  onCancel(): void {
    this.dialogRef.close('cancel');
  }
}
