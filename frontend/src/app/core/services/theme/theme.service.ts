import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    this.loadTheme();
  }

  public toggleTheme() {
    this.isDarkTheme.next(!this.isDarkTheme.value);
    this.saveTheme();
    this.updateTheme();
  }

  public loadTheme() {
    const savedTheme = localStorage.getItem('isDarkTheme');
    if (savedTheme) {
      this.isDarkTheme.next(JSON.parse(savedTheme));
    }
    this.updateTheme();
  }

  private saveTheme() {
    localStorage.setItem('isDarkTheme', JSON.stringify(this.isDarkTheme.value));
  }

  private updateTheme() {
    if (this.isDarkTheme.value) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }
}
