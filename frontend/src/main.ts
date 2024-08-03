import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { ThemeService } from './app/core/services/theme/theme.service';

function initializeTheme() {
  const themeService = new ThemeService();
  themeService.loadTheme();
}

initializeTheme();

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
