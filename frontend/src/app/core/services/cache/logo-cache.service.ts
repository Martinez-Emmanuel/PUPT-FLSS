import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LogoCacheService {
  private readonly CACHE_KEY = 'pupt_logo_cache';
  private logoBase64Subject = new BehaviorSubject<string>('');
  public logo$ = this.logoBase64Subject.asObservable();

  constructor() {
    this.initializeCache();
  }

  private initializeCache(): void {
    // Check localStorage first
    const cachedLogo = localStorage.getItem(this.CACHE_KEY);

    if (cachedLogo) {
      this.logoBase64Subject.next(cachedLogo);
    } else {
      this.cacheLogoImage();
    }
  }

  private cacheLogoImage(): void {
    const img = new Image();
    img.crossOrigin = 'Anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0);

      const base64 = canvas.toDataURL('image/png');

      // Store in both subject and localStorage
      this.logoBase64Subject.next(base64);
      localStorage.setItem(this.CACHE_KEY, base64);
    };

    img.src = 'assets/images/pup_taguig_logo.png';
  }

  public getLogoBase64(): Observable<string> {
    return this.logo$;
  }
}