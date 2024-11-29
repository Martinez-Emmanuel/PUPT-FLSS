import { Component } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

@Component({
    selector: 'app-dialog-info',
    imports: [MatButtonModule, MatCheckboxModule, FormsModule, MatSymbolDirective],
    templateUrl: './dialog-info.component.html',
    styleUrls: ['./dialog-info.component.scss']
})
export class DialogInfoComponent {
  doNotShowAgain: boolean = false;

  constructor(private dialogRef: MatDialogRef<DialogInfoComponent>) {}

  /**
   * Handles the "Proceed" button click.
   * Closes the dialog and passes the user's preference.
   */
  onProceed(): void {
    this.dialogRef.close({ doNotShowAgain: this.doNotShowAgain });
  }
}
