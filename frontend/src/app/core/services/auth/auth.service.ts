import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { Observable } from 'rxjs';
import { map, tap, switchMap, finalize } from 'rxjs/operators';

import { CookieService } from 'ngx-cookie-service';

import { environment } from '../../../../environments/environment.dev';
import { environmentOAuth } from '../../../../environments/env.auth';

import { HrisHealthService } from '../health/hris-health.service';

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
  private hrisUrl = environmentOAuth.hrisUrl;
  private clientId = environmentOAuth.clientId;
  private clientSecret = environmentOAuth.clientSecret;
  private redirectUri = `${environment.appUrl}/auth/callback`;

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router,
    private hrisHealthService: HrisHealthService,
  ) {}

  // ==============================
  // OAuth-based HRIS auth methods
  // ==============================
  checkHrisHealth(): Observable<boolean> {
    return this.hrisHealthService.checkHealth();
  }

  // Initiate OAuth flow
  initiateHrisLogin(): void {
    const state = this.generateRandomState();
    console.log('Generated state:', state);

    // Store state in localStorage instead of cookies/sessionStorage
    localStorage.setItem('oauth_state', state);

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      state: state,
    });

    window.location.href = `${
      environmentOAuth.hrisFrontendUrl
    }/auth/oauth?${params.toString()}`;
  }

  // Handle OAuth callback
  handleCallback(code: string, state: string): Observable<OAuthTokenResponse> {
    console.log('Handling callback with state:', state);

    const savedState = localStorage.getItem('oauth_state');
    console.log('Saved state:', savedState);

    if (!savedState) {
      console.error('No saved state found in localStorage');
      throw new Error('No saved state found');
    }

    if (state !== savedState) {
      console.error('State mismatch:', { received: state, saved: savedState });
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
      .post<OAuthTokenResponse>(`${this.hrisUrl}/api/oauth/token`, tokenRequest)
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
            response.access_token
          ).pipe(
            tap((processResponse) => {
              const expiryDate = new Date(processResponse.expires_at);

              // Store Sanctum token
              this.setSanctumToken(
                processResponse.token,
                processResponse.expires_at
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
            map(() => response)
          );
        })
      );
  }

  validateHrisToken(token: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.post(
      `${this.hrisUrl}/api/oauth/validate`,
      {},
      { headers }
    );
  }

  processFacultyData(facultyData: any, hrisToken: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/oauth/process-faculty`, {
      faculty_data: facultyData,
      hris_token: hrisToken,
    });
  }

  // ==============================
  // Internal FLSS auth methods
  // ==============================
  flssLogin(email: string, password: string): Observable<any> {
    const loginData = {
      email: email,
      password: password,
    };
    return this.http.post(`${this.baseUrl}/login`, loginData);
  }

  logout(): Observable<any> {
    return this.http.post(`${this.baseUrl}/logout`, {}).pipe(
      finalize(() => {
        this.clearCookies();
        this.router.navigate(['/login']);
      })
    );
  }

  // ==============================
  // Helper methods
  // ==============================
  private generateRandomState(): string {
    const array = new Uint32Array(8);
    crypto.getRandomValues(array);
    return Array.from(array, (dec) => dec.toString(16).padStart(8, '0')).join(
      ''
    );
  }

  // ==============================
  // Cookies handling methods
  // ==============================
  getToken(): string {
    return this.cookieService.get('token');
  }

  private setToken(hrisToken: string, expiresIn: number): void {
    const expiryDate = new Date();
    expiryDate.setSeconds(expiryDate.getSeconds() + expiresIn);

    // Store HRIS token separately
    this.cookieService.set('hris_token', hrisToken, {
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
      'Strict'
    );
    this.cookieService.set(
      'user_name',
      user.name,
      expiryDate,
      '/',
      '',
      true,
      'Strict'
    );
    this.cookieService.set(
      'user_email',
      user.email,
      expiryDate,
      '/',
      '',
      true,
      'Strict'
    );
    this.cookieService.set(
      'user_role',
      user.role,
      expiryDate,
      '/',
      '',
      true,
      'Strict'
    );

    if (user.faculty) {
      this.cookieService.set(
        'faculty_id',
        user.faculty.faculty_id,
        expiryDate,
        '/',
        '',
        true,
        'Strict'
      );
      this.cookieService.set(
        'faculty_type',
        user.faculty.faculty_type,
        expiryDate,
        '/',
        '',
        true,
        'Strict'
      );
      this.cookieService.set(
        'faculty_units',
        user.faculty.faculty_units,
        expiryDate,
        '/',
        '',
        true,
        'Strict'
      );
    }
  }

  clearCookies(): void {
    const cookiesToClear = [
      'token',
      'hris_token',
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
}
