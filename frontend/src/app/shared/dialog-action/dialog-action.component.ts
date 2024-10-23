import { Component, Inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface DialogActionData {
  type: 'preferences' | 'publish';
  academicYear: string;
  semester: string;
  currentState: boolean;
}

@Component({
  selector: 'app-dialog-action',
  standalone: true,
  imports: [RouterLink, MatDialogModule, MatButtonModule],
  templateUrl: './dialog-action.component.html',
  styleUrl: './dialog-action.component.scss',
})
export class DialogActionComponent {
  dialogTitle!: string;
  actionText!: string;
  navigationLink!: string;
  linkText!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogActionData,
    private dialogRef: MatDialogRef<DialogActionComponent>
  ) {
    this.initializeDialogContent();
  }

  private initializeDialogContent(): void {
    if (this.data.type === 'preferences') {
      this.dialogTitle = 'Faculty Preferences Submission';
      this.actionText = this.data.currentState ? 'Disable' : 'Enable';
      this.navigationLink = '/admin/faculty-preferences';
      this.linkText = 'Faculty Preferences';
    } else {
      this.dialogTitle = 'Faculty Load and Schedule';
      this.actionText = this.data.currentState ? 'Unpublish' : 'Publish';
      this.navigationLink = '/admin/reports/faculty';
      this.linkText = 'Faculty Official Reports';
    }
  }

  closeDialog(): void {
    this.dialogRef.close(false);
  }

  confirmAction(): void {
    this.dialogRef.close(true);
  }
}
