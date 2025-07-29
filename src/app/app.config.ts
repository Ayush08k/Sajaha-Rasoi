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
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { provideAppCheck, initializeAppCheck, ReCaptchaV3Provider } from '@angular/fire/app-check';
import { environment } from '../environments/environment';
import { getApp as _getApp, FirebaseApp } from '@angular/fire/app';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'top' })
    ),
    provideClientHydration(withEventReplay()),
    provideFirebaseApp(() => initializeApp({ projectId: "saajha-rasoi01", appId: "1:302689735135:web:e30bc288de751f5477f46a", storageBucket: "saajha-rasoi01.firebasestorage.app", apiKey: "AIzaSyAmnBB0W_mO5sIJkNcgLfSr_aIoFHSSsQQ", authDomain: "saajha-rasoi01.firebaseapp.com", messagingSenderId: "302689735135", measurementId: "G-H89GSJKFR5" })), provideAuth(() => getAuth()), provideFirestore(() => getFirestore()),
    provideAppCheck(() => 
      initializeAppCheck(getApp(), {
        // Replace this with your actual reCAPTCHA v3 site key
        provider: new ReCaptchaV3Provider('6LdhsJArAAAAAM8gPz6rbNBugEPYz8mgs1vE-wG8'),
        isTokenAutoRefreshEnabled: true
      })
    )
  ]
};
function getApp(): FirebaseApp {
  return _getApp();
}

