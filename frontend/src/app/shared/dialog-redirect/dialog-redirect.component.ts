import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { CustomSpinnerComponent } from '../custom-spinner/custom-spinner.component';

import { AuthService } from '../../core/services/auth/auth.service';

import { slideTextAnimation } from '../../core/animations/animations';

@Component({
  selector: 'app-dialog-redirect',
  imports: [CommonModule, CustomSpinnerComponent, MatSymbolDirective],
  templateUrl: './dialog-redirect.component.html',
  styleUrls: ['./dialog-redirect.component.scss'],
  animations: [slideTextAnimation],
})
export class DialogRedirectComponent implements OnInit {
  checkingFesr: boolean;
  redirecting: boolean;

  constructor(
    private dialogRef: MatDialogRef<DialogRedirectComponent>,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.checkingFesr = data.checkingFesr;
    this.redirecting = false;
  }

  ngOnInit(): void {
    if (!this.checkingFesr) {
      this.initiateRedirection();
    }
  }

  updateState(checkingFesr: boolean, redirecting: boolean): void {
    this.checkingFesr = checkingFesr;
    this.redirecting = redirecting;
    if (this.redirecting) {
      this.initiateRedirection();
    }
  }

  initiateRedirection(): void {
    setTimeout(() => {
      this.dialogRef.close();
      this.authService.initiateFesrLogin();
    }, 2000);
  }

  get currentTextState(): 'connecting' | 'redirecting' {
    if (this.checkingFesr) return 'connecting';
    if (this.redirecting) return 'redirecting';

    return 'connecting';
  }
}
