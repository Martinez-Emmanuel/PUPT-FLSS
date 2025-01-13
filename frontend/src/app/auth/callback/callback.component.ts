import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, finalize, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

import { CustomSpinnerComponent } from '../../shared/custom-spinner/custom-spinner.component';
import { AccessDeniedDialogComponent } from './access-denied-dialog/access-denied-dialog.component';

import { AuthService } from '../../core/services/auth/auth.service';

import { environmentOAuth } from '../../../environments/env.auth';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  imports: [CustomSpinnerComponent],
})
export class CallbackComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();
  loadingText = 'Processing your request...';
  private originalOAuthParams?: {
    client_id: string;
    redirect_uri: string;
    state: string;
    response_type: string;
    user_id: string;
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        const { code, state, error } = params;

        // Store the original state if available
        if (state) {
          try {
            const decodedState = JSON.parse(atob(state));
            if (decodedState.originalParams) {
              this.originalOAuthParams = decodedState.originalParams;
            }
          } catch (e) {
            console.debug(
              'State is not a complex object, continuing with simple state validation'
            );
          }
        }

        if (error === 'access_denied') {
          this.loadingText = 'Processing';
          this.showAccessDeniedDialog();
          return;
        }

        if (error) {
          this.handleError(error);
          return;
        }

        if (!code || !state) {
          this.handleError('Missing required parameters');
          return;
        }

        this.loadingText = 'Almost there! Finishing your login';
        const minimumDelay = timer(3000);

        this.authService
          .handleCallback(code, state)
          .pipe(
            switchMap((response) =>
              minimumDelay.pipe(finalize(() => response))
            ),
            takeUntil(this.unsubscribe$)
          )
          .subscribe({
            next: (response) => {
              this.router.navigate(['/faculty/home']);
            },
            error: (error) => {
              console.error('OAuth callback error:', error);
              this.handleError(error.message || 'Failed to process login');
            },
          });
      });
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private handleError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
    });
    this.router.navigate(['/login']);
  }

  private returnToConsent() {
    if (this.originalOAuthParams) {
      const params = new URLSearchParams({
        client_id: this.originalOAuthParams.client_id,
        redirect_uri: this.originalOAuthParams.redirect_uri,
        state: this.originalOAuthParams.state,
        response_type: this.originalOAuthParams.response_type,
        user_id: this.originalOAuthParams.user_id,
      });

      window.location.href = `${
        environmentOAuth.hrisFrontendUrl
      }/auth/oauth/consent?${params.toString()}`;
    } else {
      this.authService.initiateHrisLogin();
    }
  }

  private showAccessDeniedDialog() {
    const dialogRef = this.dialog.open(AccessDeniedDialogComponent, {
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'retry') {
        this.returnToConsent();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
}
