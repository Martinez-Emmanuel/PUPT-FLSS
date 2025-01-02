import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Subject, finalize, timer } from 'rxjs';
import { switchMap, takeUntil } from 'rxjs/operators';

import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomSpinnerComponent } from '../../shared/custom-spinner/custom-spinner.component';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  imports: [CustomSpinnerComponent],
})
export class CallbackComponent implements OnInit, OnDestroy {
  private unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((params) => {
        const { code, state, error } = params;

        if (error) {
          this.handleError(error);
          return;
        }

        if (!code || !state) {
          this.handleError('Missing required parameters');
          return;
        }

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
}
