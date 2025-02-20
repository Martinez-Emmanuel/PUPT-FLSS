import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { LogoService } from '../logo/logo.service';

@Injectable({
  providedIn: 'root',
})
export class LogoCacheService {
  private readonly CACHE_KEYS = {
    university: 'pupt_university_logo_cache',
    government: 'pupt_government_logo_cache',
  } as const;

  private readonly DEFAULT_UNIVERSITY_LOGO = 'pup_taguig_logo.png';

  private universityLogoSubject = new BehaviorSubject<string>('');
  private governmentLogoSubject = new BehaviorSubject<string>('');

  public universityLogo$ = this.universityLogoSubject.asObservable();
  public governmentLogo$ = this.governmentLogoSubject.asObservable();

  constructor(private logoService: LogoService, private http: HttpClient) {
    this.initializeCache();
  }

  private initializeCache(): void {
    this.loadLogo('university');
    this.loadLogo('government');
  }

  private loadLogo(type: 'university' | 'government'): void {
    const subject =
      type === 'university'
        ? this.universityLogoSubject
        : this.governmentLogoSubject;
    const cachedLogo = localStorage.getItem(this.CACHE_KEYS[type]);

    // First try to show cached logo if available
    if (cachedLogo) {
      subject.next(cachedLogo);
    }

    // Then fetch fresh logo
    this.fetchAndCacheLogo(type);
  }

  private fetchAndCacheLogo(type: 'university' | 'government'): void {
    const subject =
      type === 'university'
        ? this.universityLogoSubject
        : this.governmentLogoSubject;

    this.logoService
      .getLogo(type)
      .pipe(
        switchMap((logo) => {
          if (!logo) {
            // Only load default logo for university
            return type === 'university' ? this.loadDefaultLogo() : of('');
          }

          const timestamp = new Date().getTime();
          return this.http
            .get(`${this.logoService.apiUrl}/image/${type}?t=${timestamp}`, {
              responseType: 'blob',
              headers: { Accept: 'image/jpeg,image/png,image/jpg' },
            })
            .pipe(
              switchMap((blob) => this.blobToBase64(blob)),
              catchError(() =>
                type === 'university' ? this.loadDefaultLogo() : of(''),
              ),
            );
        }),
        tap((base64) => {
          subject.next(base64);
          if (base64) {
            localStorage.setItem(this.CACHE_KEYS[type], base64);
          } else {
            localStorage.removeItem(this.CACHE_KEYS[type]);
          }
        }),
      )
      .subscribe();
  }

  private loadDefaultLogo(): Observable<string> {
    return new Observable((observer) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);

        const base64 = canvas.toDataURL('image/png');
        observer.next(base64);
        observer.complete();
      };

      img.onerror = () => {
        observer.error(new Error('Failed to load default logo'));
        observer.complete();
      };

      img.src = `assets/images/${this.DEFAULT_UNIVERSITY_LOGO}`;
    });
  }

  private blobToBase64(blob: Blob): Observable<string> {
    return new Observable((observer) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        observer.next(reader.result as string);
        observer.complete();
      };
      reader.onerror = () => {
        observer.error(new Error('Failed to convert blob to base64'));
        observer.complete();
      };
      reader.readAsDataURL(blob);
    });
  }

  public refreshCache(type?: 'university' | 'government'): void {
    if (!type || type === 'university') {
      localStorage.removeItem(this.CACHE_KEYS.university);
      this.loadLogo('university');
    }
    if (!type || type === 'government') {
      localStorage.removeItem(this.CACHE_KEYS.government);
      this.loadLogo('government');
    }
  }
}
