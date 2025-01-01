import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatSnackBar } from '@angular/material/snack-bar';

import { CustomSpinnerComponent } from '../../shared/custom-spinner/custom-spinner.component';

import { AuthService } from '../../core/services/auth/auth.service';

@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
  styleUrls: ['./callback.component.scss'],
  imports: [CustomSpinnerComponent],
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
