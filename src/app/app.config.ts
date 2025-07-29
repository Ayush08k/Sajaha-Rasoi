import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
<<<<<<< HEAD
import { provideRouter } from '@angular/router';
=======
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
>>>>>>> parent of 9d09627 (Firestore connected)

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
<<<<<<< HEAD
    provideRouter(routes), provideClientHydration(withEventReplay())
=======
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideClientHydration(withEventReplay())
>>>>>>> parent of 9d09627 (Firestore connected)
  ]
};
