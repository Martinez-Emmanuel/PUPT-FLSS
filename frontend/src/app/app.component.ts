import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ThemeService } from './core/services/theme/theme.service';
import { TitleService } from './core/services/title/title.service';
import { routeAnimation } from './core/animations/animations';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  animations: [routeAnimation],
})
export class AppComponent implements OnInit {
  constructor(
    private themeService: ThemeService,
    private titleService: TitleService
  ) {}

  ngOnInit() {
    this.titleService.initializeTitleService();
    this.themeService.loadTheme();
  }

  getRouteState(outlet: RouterOutlet) {
    // Get the current route's parent path if it exists
    const parentPath = outlet?.activatedRouteData?.['role'] || 
                      outlet?.activatedRouteData?.['animation'] || 
                      'default';
    
    // Return the parent path for animation state
    return parentPath;
  }
}
