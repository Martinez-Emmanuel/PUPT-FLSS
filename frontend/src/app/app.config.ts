import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { MAT_RIPPLE_GLOBAL_OPTIONS, RippleGlobalOptions } from '@angular/material/core';

import { routes } from './app.routes';
import { AuthGuard } from './core/guards/auth.guard';

const globalRippleConfig: RippleGlobalOptions = {
  animation: {
    enterDuration: 500,
    exitDuration: 500
  }
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(routes),

    provideAnimationsAsync(),

    provideHttpClient(),

    AuthGuard,

    { provide: MAT_RIPPLE_GLOBAL_OPTIONS, useValue: globalRippleConfig },
  ],
};
