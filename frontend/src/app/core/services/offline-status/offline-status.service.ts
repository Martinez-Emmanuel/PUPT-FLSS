import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class OfflineStatusService {
  private online$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    merge(
      fromEvent(window, 'online').pipe(map(() => true)),
      fromEvent(window, 'offline').pipe(map(() => false)),
    ).subscribe(this.online$);
  }

  isOnline(): Observable<boolean> {
    return this.online$.asObservable();
  }
}
