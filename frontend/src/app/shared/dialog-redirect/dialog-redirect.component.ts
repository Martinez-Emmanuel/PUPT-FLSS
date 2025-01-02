import { Component, OnInit, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSymbolDirective } from '../../core/imports/mat-symbol.directive';

import { CustomSpinnerComponent } from '../custom-spinner/custom-spinner.component';

import { AuthService } from '../../core/services/auth/auth.service';

import { slideTextAnimation } from '../../core/animations/animations';

@Component({
  selector: 'app-dialog-redirect',
  standalone: true,
  imports: [CommonModule, CustomSpinnerComponent, MatSymbolDirective],
  templateUrl: './dialog-redirect.component.html',
  styleUrls: ['./dialog-redirect.component.scss'],
  animations: [slideTextAnimation],
})
export class DialogRedirectComponent implements OnInit {
  checkingHris: boolean;
  redirecting: boolean;

  constructor(
    private dialogRef: MatDialogRef<DialogRedirectComponent>,
    private authService: AuthService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.checkingHris = data.checkingHris;
    this.redirecting = false;
  }

  ngOnInit(): void {
    if (!this.checkingHris) {
      this.initiateRedirection();
    }
  }

  updateState(checkingHris: boolean, redirecting: boolean): void {
    this.checkingHris = checkingHris;
    this.redirecting = redirecting;
    if (this.redirecting) {
      this.initiateRedirection();
    }
  }

  initiateRedirection(): void {
    setTimeout(() => {
      this.dialogRef.close();
      this.authService.initiateHrisLogin();
    }, 2000);
  }

  get currentTextState(): 'connecting' | 'redirecting' {
    if (this.checkingHris) return 'connecting';
    if (this.redirecting) return 'redirecting';

    return 'connecting';
  }
}
