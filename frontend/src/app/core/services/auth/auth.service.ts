import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map, tap, switchMap, finalize, catchError } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../../environments/environment.dev';
import { environmentOAuth } from '../../../../environments/env.auth';

import { FesrHealthService } from '../health/fesr-health.service';

export interface LoginError {
  message: string;
  status: number;
}

export interface LoginResponse {
  token: string;
  expires_at: string;
  user: any;
}

interface OAuthTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
  faculty_data?: any;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseUrl = environment.apiUrl;
  private fesrUrl = environmentOAuth.fesrUrl;
  private clientId = environmentOAuth.clientId;
  private clientSecret = environmentOAuth.clientSecret;
  private redirectUri = `${environment.appUrl}/auth/callback`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private fesrHealthService: FesrHealthService,
  ) {}

  // ==============================
  // OAuth-based FESR auth methods
  // ==============================
  checkFesrHealth(): Observable<boolean> {
    return this.fesrHealthService.checkHealth();
  }

  // Initiate OAuth flow
  initiateFesrLogin(): void {
    const state = this.generateRandomState();

    localStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
    });

    window.location.href = `${
      environmentOAuth.fesrFrontendUrl
    }/auth/oauth?${params.toString()}`;
  }

  // Handle OAuth callback
  handleCallback(code: string, state: string): Observable<OAuthTokenResponse> {
    const savedState = localStorage.getItem('oauth_state');

    if (!savedState) {
      throw new Error('No saved state found');
    }

    if (state !== savedState) {
      throw new Error('Invalid state parameter');
    }

    // Clear the state after verification
    localStorage.removeItem('oauth_state');

    const tokenRequest = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: this.redirectUri,
      client_id: this.clientId,
      client_secret: this.clientSecret,
    };

    return this.http
      .post<OAuthTokenResponse>(`${this.fesrUrl}/api/oauth/token`, tokenRequest)
      .pipe(
        switchMap((response) => {
          if (!response.access_token) {
            throw new Error('No access token received');
          }

          this.setToken(response.access_token, response.expires_in);

          if (!response.faculty_data) {
            throw new Error('No faculty data received');
          }

          return this.processFacultyData(
            response.faculty_data,
            response.access_token,
          ).pipe(
            tap((processResponse) => {
              const expiryDate = new Date(processResponse.expires_at);

              // Store Sanctum token
              this.setSanctumToken(
                processResponse.token,
                processResponse.expires_at,
              );

              const userInfo = {
                id: processResponse.user.id,
                name: processResponse.user.name,
                email: processResponse.user.email,
                role: processResponse.user.role,
                faculty: {
                  faculty_id: processResponse.user.faculty.faculty_id,
                  faculty_type: processResponse.user.faculty.faculty_type,
                  faculty_units: processResponse.user.faculty.faculty_units,
                },
              };

              this.setUserInfo(userInfo, expiryDate.toISOString());
            }),
            map(() => response),
          );
        }),
      );
  }

  validateFesrToken(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(
      `${this.fesrUrl}/api/oauth/validate`,
      {},
      { headers },
    );
  }

  processFacultyData(facultyData: any, fesrToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/oauth/process-faculty`, {
      faculty_data: facultyData,
      fesr_token: fesrToken,
    });
  }

  // ==============================
  // Internal FLSS auth methods
  // ==============================
  flssLogin(
    email: string,
    password: string,
    allowedRoles: string[],
  ): Observable<any> {
    const loginData = {
      email: email,
      password: password,
      allowed_roles: allowedRoles,
    };
    return this.http.post(`${this.baseUrl}/login`, loginData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      finalize(() => {
        this.clearCookies();
        this.router.navigate(['/login']);
      }),
    );
  }

  // ==============================
  // Password Reset methods
  // ==============================
  sendPasswordResetEmail(email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/password/email`, { email });
  }

  verifyResetToken(token: string, email: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/password/verify-token`, {
      token,
      email,
    });
  }

  resetPassword(
    token: string,
    email: string,
    password: string,
    password_confirmation: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/password/reset`, {
      token,
      email,
      password,
      password_confirmation,
    });
  }

  // ==============================
  // Password management methods
  // ==============================
  changePassword(
    currentPassword: string,
    newPassword: string,
    newPasswordConfirmation: string,
  ): Observable<any> {
    return this.http.post(`${this.baseUrl}/change-password`, {
      current_password: currentPassword,
      password: newPassword,
      password_confirmation: newPasswordConfirmation,
    });
  }

  // ==============================
  // Helper methods
  // ==============================
  private generateRandomState(): string {
    const array = new Uint32Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (dec) => dec.toString(16).padStart(8, '0')).join(
      '',
    );
  }

  // ==============================
  // Cookies handling methods
  // ==============================
  getToken(): string {
    return this.cookieService.get('token');
  }

  private setToken(fesrToken: string, expiresIn: number): void {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

    // Store FESR token separately
    this.cookieService.set('fesr_token', fesrToken, {
      expires: expiryDate,
      path: '/',
      sameSite: 'Lax',
      secure: false,
    });
  }

  setSanctumToken(sanctumToken: string, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    // Store Sanctum token as the main token
    this.cookieService.set('token', sanctumToken, {
      expires: expiryDate,
      path: '/',
      sameSite: 'Lax',
      secure: false,
    });
  }

  setUserInfo(user: any, expiresAt: string): void {
    const expiryDate = new Date(expiresAt);
    this.cookieService.set(
      'user_id',
      user.id,
      expiryDate,
      '/',
      '',
      true,
      'Strict',
    );
    this.cookieService.set(
      'user_name',
      user.name,
      expiryDate,
      '/',
      '',
      true,
      'Strict',
    );
    this.cookieService.set(
      'user_email',
      user.email,
      expiryDate,
      '/',
      '',
      true,
      'Strict',
    );
    this.cookieService.set(
      'user_role',
      user.role,
      expiryDate,
      '/',
      '',
      true,
      'Strict',
    );

    if (user.faculty) {
      this.cookieService.set(
        'faculty_id',
        user.faculty.faculty_id,
        expiryDate,
        '/',
        '',
        true,
        'Strict',
      );
      this.cookieService.set(
        'faculty_type',
        user.faculty.faculty_type,
        expiryDate,
        '/',
        '',
        true,
        'Strict',
      );
      this.cookieService.set(
        'faculty_units',
        user.faculty.faculty_units,
        expiryDate,
        '/',
        '',
        true,
        'Strict',
      );
    }
  }

  clearCookies(): void {
    const cookiesToClear = [
      'token',
      'fesr_token',
      'oauth_state',
      'user_id',
      'user_name',
      'user_email',
      'user_role',
      'faculty_id',
      'faculty_type',
      'faculty_units',
    ];

    cookiesToClear.forEach((cookieName) => {
      this.cookieService.delete(cookieName, '/');
    });

    localStorage.removeItem('oauth_state');
  }

  /**
   * Handles login with error handling and role validation
   */
  handleLogin(
    email: string,
    password: string,
    allowedRoles: string[],
  ): Observable<LoginResponse> {
    return this.flssLogin(email, password, allowedRoles).pipe(
      catchError((error) => {
        const errorMessage = this.handleLoginError(error);
        throw { message: errorMessage, status: error.status };
      }),
    );
  }

  /**
   * Unified error handling for login attempts
   */
  private handleLoginError(error: any): string {
    let errorMessage = '';
    if (error.error?.message) {
      errorMessage = error.error.message;
    } else if (typeof error.error === 'string') {
      try {
        const parsedError = JSON.parse(error.error);
        errorMessage = parsedError.message;
      } catch {
        errorMessage = error.error;
      }
    }

    if (!errorMessage || errorMessage.trim() === '') {
      return this.getDefaultErrorMessage(error.status);
    }

    return errorMessage;
  }

  private getDefaultErrorMessage(status: number): string {
    switch (status) {
      case 401:
        return 'Invalid credentials.';
      case 403:
        return 'Access forbidden.';
      case 429:
        return 'Too many login attempts. Please try again later.';
      case 500:
        return 'Server error occurred. Please try again later.';
      case 0:
        return 'Unable to connect to the server. Please check your internet connection.';
      default:
        return 'An unexpected error occurred. Please try again later.';
    }
  }
}
