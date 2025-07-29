import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
import { initializeApp, provideFirebaseApp, getApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { getStorage, provideStorage } from '@angular/fire/storage';

// ** ADDED THESE IMPORTS FOR APP CHECK **
import { provideAppCheck, initializeAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),

    // ** ADDED THIS ENTIRE BLOCK FOR APP CHECK **
    provideAppCheck(() => {
      // This line forces the debug token to appear in your console
      (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;

      return initializeAppCheck(getApp(), {
        // IMPORTANT: Replace this with your actual reCAPTCHA v3 site key
        provider: new ReCaptchaV3Provider('6LdhsJArAAAAAM8gPz6rbNBugEPYz8mgs1vE-wG8'),
        isTokenAutoRefreshEnabled: true
      });
    })
  ]
};
