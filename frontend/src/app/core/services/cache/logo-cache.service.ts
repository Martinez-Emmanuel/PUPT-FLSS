import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { LogoService } from '../logo/logo.service';

@Injectable({
  providedIn: 'root',
})
export class LogoCacheService {
  private readonly CACHE_KEY = 'pupt_logo_cache';
  private readonly VERSION_KEY = 'pupt_logo_version';
  private logoBase64Subject = new BehaviorSubject<string>('');
  public logo$ = this.logoBase64Subject.asObservable();

  constructor(private logoService: LogoService, private http: HttpClient) {
    this.initializeCache();
  }

  private initializeCache(): void {
    const cachedLogo = localStorage.getItem(this.CACHE_KEY);
    const cachedVersion = localStorage.getItem(this.VERSION_KEY);

    this.logoService.getLogo('university').subscribe({
      next: (logo) => {
        const currentVersion = logo ? logo.id.toString() : '0';

        if (!cachedLogo || !cachedVersion || cachedVersion !== currentVersion) {
          this.cacheLogoImage();
        } else {
          this.logoBase64Subject.next(cachedLogo);
        }
      },
      error: () => {
        if (cachedLogo) {
          this.logoBase64Subject.next(cachedLogo);
        } else {
          this.cacheLogoImage();
        }
      },
    });
  }

  private cacheLogoImage(): void {
    this.logoService
      .getLogo('university')
      .pipe(
        catchError(() => of(null)),
        switchMap((logo) => {
          if (!logo) {
            return this.cacheDefaultLogo();
          }

          localStorage.setItem(this.VERSION_KEY, logo.id.toString());

          const timestamp = new Date().getTime();
          const imageUrl = `${this.logoService.apiUrl}/image/university?t=${timestamp}`;
          return this.http
            .get(imageUrl, {
              responseType: 'blob',
              headers: {
                Accept: 'image/jpeg,image/png,image/jpg',
              },
            })
            .pipe(
              switchMap((blob) => this.blobToBase64(blob)),
              catchError(() => this.cacheDefaultLogo()),
            );
        }),
      )
      .subscribe({
        next: (base64) => {
          if (base64) {
            this.logoBase64Subject.next(base64);
            localStorage.setItem(this.CACHE_KEY, base64);
          }
        },
        error: () => {
          this.cacheDefaultLogo().subscribe((base64) => {
            if (base64) {
              this.logoBase64Subject.next(base64);
              localStorage.setItem(this.CACHE_KEY, base64);
              localStorage.setItem(this.VERSION_KEY, '0');
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

  private cacheDefaultLogo(): Observable<string> {
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

      img.src = 'assets/images/pup_taguig_logo.png';
    });
  }

  public getLogoBase64(): Observable<string> {
    return this.logo$;
  }

  public refreshCache(): void {
    localStorage.removeItem(this.CACHE_KEY);
    this.cacheLogoImage();
  }
}
