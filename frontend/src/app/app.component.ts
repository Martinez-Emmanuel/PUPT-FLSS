import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { ThemeService } from './core/services/theme/theme.service';
import { fadeAnimation } from './core/animations/animations';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
    animations: [fadeAnimation]
})
export class AppComponent {
  title = 'PUPT-FLSS';

  constructor(private themeService: ThemeService) {}
}
