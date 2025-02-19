import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { LogoService } from '../logo/logo.service';

@Injectable({
  providedIn: 'root',
})
export class LogoCacheService {
  private readonly UNIVERSITY_CACHE_KEY = 'pupt_university_logo_cache';
  private readonly GOVERNMENT_CACHE_KEY = 'pupt_government_logo_cache';
  private readonly UNIVERSITY_VERSION_KEY = 'pupt_university_logo_version';
  private readonly GOVERNMENT_VERSION_KEY = 'pupt_government_logo_version';

  private universityLogoSubject = new BehaviorSubject<string>('');
  private governmentLogoSubject = new BehaviorSubject<string>('');

  public universityLogo$ = this.universityLogoSubject.asObservable();
  public governmentLogo$ = this.governmentLogoSubject.asObservable();

  constructor(private logoService: LogoService, private http: HttpClient) {
    this.initializeCache();
  }

  private initializeCache(): void {
    this.initializeLogo('university');
    this.initializeLogo('government');
  }

  private initializeLogo(type: 'university' | 'government'): void {
    const cacheKey =
      type === 'university'
        ? this.UNIVERSITY_CACHE_KEY
        : this.GOVERNMENT_CACHE_KEY;
    const versionKey =
      type === 'university'
        ? this.UNIVERSITY_VERSION_KEY
        : this.GOVERNMENT_VERSION_KEY;
    const subject =
      type === 'university'
        ? this.universityLogoSubject
        : this.governmentLogoSubject;
    const defaultLogo =
      type === 'university' ? 'pup_taguig_logo.png' : 'government_logo.png';

    const cachedLogo = localStorage.getItem(cacheKey);
    const cachedVersion = localStorage.getItem(versionKey);

    this.logoService.getLogo(type).subscribe({
      next: (logo) => {
        if (!logo) {
          // If no logo exists, use default logo
          this.cacheDefaultLogo(defaultLogo).subscribe((base64) => {
            if (base64) {
              subject.next(base64);
              localStorage.setItem(cacheKey, base64);
              localStorage.setItem(versionKey, '0');
            }
          });
          return;
        }

        const currentVersion = logo.id.toString();
        if (!cachedLogo || !cachedVersion || cachedVersion !== currentVersion) {
          this.cacheLogoImage(type);
        } else {
          subject.next(cachedLogo);
        }
      },
      error: () => {
        if (cachedLogo) {
          subject.next(cachedLogo);
        } else {
          this.cacheLogoImage(type);
        }
      },
    });
  }

  private cacheLogoImage(type: 'university' | 'government'): void {
    const cacheKey =
      type === 'university'
        ? this.UNIVERSITY_CACHE_KEY
        : this.GOVERNMENT_CACHE_KEY;
    const versionKey =
      type === 'university'
        ? this.UNIVERSITY_VERSION_KEY
        : this.GOVERNMENT_VERSION_KEY;
    const subject =
      type === 'university'
        ? this.universityLogoSubject
        : this.governmentLogoSubject;
    const defaultLogo =
      type === 'university' ? 'pup_taguig_logo.png' : 'government_logo.png';

    this.logoService
      .getLogo(type)
      .pipe(
        catchError(() => of(null)),
        switchMap((logo) => {
          if (!logo) {
            return this.cacheDefaultLogo(defaultLogo);
          }

          localStorage.setItem(versionKey, logo.id.toString());

          const timestamp = new Date().getTime();
          const imageUrl = `${this.logoService.apiUrl}/image/${type}?t=${timestamp}`;
          return this.http
            .get(imageUrl, {
              responseType: 'blob',
              headers: {
                Accept: 'image/jpeg,image/png,image/jpg',
              },
            })
            .pipe(
              switchMap((blob) => this.blobToBase64(blob)),
              catchError(() => this.cacheDefaultLogo(defaultLogo)),
            );
        }),
      )
      .subscribe({
        next: (base64) => {
          if (base64) {
            subject.next(base64);
            localStorage.setItem(cacheKey, base64);
          }
        },
        error: () => {
          this.cacheDefaultLogo(defaultLogo).subscribe((base64) => {
            if (base64) {
              subject.next(base64);
              localStorage.setItem(cacheKey, base64);
              localStorage.setItem(versionKey, '0');
            }
          });
        },
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

  private cacheDefaultLogo(filename: string): Observable<string> {
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

      img.src = `assets/images/${filename}`;
    });
  }

  public getUniversityLogoBase64(): Observable<string> {
    return this.universityLogo$;
  }

  public getGovernmentLogoBase64(): Observable<string> {
    return this.governmentLogo$;
  }

  public refreshCache(type?: 'university' | 'government'): void {
    if (!type || type === 'university') {
      localStorage.removeItem(this.UNIVERSITY_CACHE_KEY);
      localStorage.removeItem(this.UNIVERSITY_VERSION_KEY);
      this.initializeLogo('university');
    }
    if (!type || type === 'government') {
      localStorage.removeItem(this.GOVERNMENT_CACHE_KEY);
      localStorage.removeItem(this.GOVERNMENT_VERSION_KEY);
      this.initializeLogo('government');
    }
  }
}
