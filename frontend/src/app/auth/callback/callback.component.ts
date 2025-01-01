import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-callback',
  template: `
    <div class="callback-container">
      <mat-spinner></mat-spinner>
      <p>Processing login...</p>
    </div>
  `,
  styles: [
    `
      .callback-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        gap: 20px;
      }
    `,
  ],
  standalone: true,
  imports: [MatProgressSpinnerModule],
})
export class CallbackComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      const { code, state, error } = params;

      if (error) {
        this.handleError(error);
        return;
      }

      if (!code || !state) {
        this.handleError('Missing required parameters');
        return;
      }

      this.authService.handleCallback(code, state).subscribe({
        next: (response) => {
          // All cookies and user data are now set
          this.router.navigate(['/faculty/home']);
        },
        error: (error) => {
          console.error('OAuth callback error:', error);
          this.handleError(error.message || 'Failed to process login');
        },
      });
    });
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
