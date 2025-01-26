import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface ImageLoadState {
  url: string;
  loaded: boolean;
  error: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ImagePreloadService {
  private imageCache: Map<string, HTMLImageElement> = new Map();
  private loadingStates = new Map<string, BehaviorSubject<ImageLoadState>>();

  preloadImage(url: string): Observable<ImageLoadState> {
    if (this.loadingStates.has(url)) {
      return this.loadingStates.get(url)!.asObservable();
    }

    const state = new BehaviorSubject<ImageLoadState>({
      url,
      loaded: false,
      error: false,
    });
    this.loadingStates.set(url, state);

    if (this.imageCache.has(url)) {
      state.next({ url, loaded: true, error: false });
      return state.asObservable();
    }

    const img = new Image();

    from(
      new Promise<void>((resolve, reject) => {
        img.onload = () => {
          this.imageCache.set(url, img);
          resolve();
        };
        img.onerror = () => reject();
        img.src = url;
      })
    )
      .pipe(
        map(() => ({ url, loaded: true, error: false })),
        catchError(() => of({ url, loaded: false, error: true }))
      )
      .subscribe((status) => state.next(status));

    return state.asObservable();
  }

  clearCache() {
    this.imageCache.clear();
    this.loadingStates.clear();
  }
}
