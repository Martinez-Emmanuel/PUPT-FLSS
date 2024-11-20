import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

@Component({
    selector: 'app-dialog-pref-success',
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatSymbolDirective],
    templateUrl: './dialog-pref-success.component.html',
    styleUrl: './dialog-pref-success.component.scss'
})
export class DialogPrefSuccessComponent {
  deadline: string;

  constructor(
    public dialogRef: MatDialogRef<DialogPrefSuccessComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { deadline: string }
  ) {
    this.deadline = data.deadline || '';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
