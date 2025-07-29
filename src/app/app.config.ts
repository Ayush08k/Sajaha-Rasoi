import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
<<<<<<< HEAD
import { provideRouter } from '@angular/router';
=======
import { provideRouter, withHashLocation, withInMemoryScrolling } from '@angular/router';
<<<<<<< HEAD
>>>>>>> parent of 9d09627 (Firestore connected)
=======
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

