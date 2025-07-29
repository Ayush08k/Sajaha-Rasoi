import { Injectable, inject, NgZone } from '@angular/core';
import { Auth, signInWithPhoneNumber, signOut, onAuthStateChanged, User, ConfirmationResult } from '@angular/fire/auth';
import { RecaptchaVerifier } from 'firebase/auth';
import { Observable } from 'rxjs';
<<<<<<< HEAD
import { Firestore, doc, setDoc, serverTimestamp, getDoc } from '@angular/fire/firestore';
=======
import { Firestore, doc, setDoc, serverTimestamp } from '@angular/fire/firestore';
>>>>>>> ff3a45c164d25325c387c30b2402b81dbad2e8aa

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private ngZone: NgZone = inject(NgZone); 

  public user$: Observable<User | null>;
  private recaptchaVerifier!: RecaptchaVerifier | null;
  public confirmationResult: ConfirmationResult | null = null;

  constructor() {
    this.user$ = new Observable(observer => {
      onAuthStateChanged(this.auth, (user) => {
        this.ngZone.run(() => {
          observer.next(user); 
          if (user) {
            this.createUserProfile(user);
          }
        });
      });
    });
  }

  /**
   * Initializes the reCAPTCHA verifier. This is crucial for phone authentication on web.
   * It needs to be called when the component containing the reCAPTCHA container element is initialized.
   */
  setupRecaptcha() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
    }

    this.recaptchaVerifier = new RecaptchaVerifier(this.auth, 'recaptcha-container', {
      'size': 'invisible',
      'callback': () => console.log('reCAPTCHA resolved.'),
      'expired-callback': () => this.destroyRecaptcha() // Clean up on expiration
    });
  }

  destroyRecaptcha() {
    if (this.recaptchaVerifier) {
      this.recaptchaVerifier.clear();
      this.recaptchaVerifier = null;
      console.log('reCAPTCHA destroyed.');
    }
  }

  /**
   * Sends the OTP (One-Time Password) to the provided phone number using Firebase.
   * The phone number must be in E.164 format (e.g., +911234567890).
   */
  async sendVerificationCode(phoneNumber: string): Promise<void> {
    if (!this.recaptchaVerifier) {
      throw new Error("reCAPTCHA not initialized. Call setupRecaptcha before sending code.");
    }
    try {
      this.confirmationResult = await signInWithPhoneNumber(this.auth, phoneNumber, this.recaptchaVerifier);
      console.log('SMS sent successfully to:', phoneNumber);
    } catch (error: any) {
      console.error('Error sending verification code:', error);
      this.confirmationResult = null; // Clear confirmation result on error

      // Reset reCAPTCHA on error to allow the user to retry the process.
      this.recaptchaVerifier?.render().then((widgetId) => {
        // @ts-ignore
        if (typeof grecaptcha !== 'undefined') {
          // @ts-ignore
          grecaptcha.reset(widgetId);
        }
      });
      throw error; // Re-throw the error to be handled by the calling component
    }
  }

  /**
   * Confirms the OTP entered by the user using the stored ConfirmationResult.
   * NOTE: Renamed from 'confirmVerificationCode' to 'verifyOtp' for compatibility with your existing login component.
   * @param otpCode The 6-digit OTP entered by the user.
   */
  async verifyOtp(otpCode: string): Promise<User | null> {
    if (!this.confirmationResult) {
      throw new Error("No pending verification. Call sendVerificationCode first.");
    }
    try {
      // Confirm the code using the ConfirmationResult object
      const credential = await this.confirmationResult.confirm(otpCode);
      this.confirmationResult = null; // Clear confirmation result after successful login
      console.log('Phone number verified successfully. User:', credential.user);
      return credential.user; // Return the authenticated user object
    } catch (error: any) {
      console.error('Error confirming verification code:', error);
      throw error; // Re-throw the error to be handled by the calling component
    }
  }

  /**
   * Signs out the current user from Firebase Authentication.
   */
  async signOut(): Promise<void> {
    try {
      await signOut(this.auth);
      this.confirmationResult = null; // Clear any pending confirmation result on sign out
<<<<<<< HEAD
      this.destroyRecaptcha(); // Clean up any recaptcha instances
=======
>>>>>>> ff3a45c164d25325c387c30b2402b81dbad2e8aa
    } catch (error: any) {
      console.error('Sign-out error:', error.message);
      throw error;
    }
  }

  /**
   * Gets the currently authenticated Firebase User object.
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Creates or updates a user profile document in Firestore.
   */
  private async createUserProfile(user: User): Promise<void> {
    if (!user.uid) return; // Ensure UID exists for the document path
    const userDocRef = doc(this.firestore, `users/${user.uid}`);
<<<<<<< HEAD

    // Check if user document already exists
    const userSnap = await getDoc(userDocRef);
    const isNewUser = !userSnap.exists();

=======
>>>>>>> ff3a45c164d25325c387c30b2402b81dbad2e8aa
    await setDoc(userDocRef, {
      uid: user.uid,
      phoneNumber: user.phoneNumber || null,
      username: user.displayName || user.phoneNumber || `User-${user.uid.slice(0, 4)}`,
      profilePictureUrl: user.photoURL || null,
<<<<<<< HEAD
      ...(isNewUser && {
        createdAt: serverTimestamp(),
        onboardingCompleted: false
      }),
      isOnline: true,
      lastSeen: serverTimestamp()
    }, { merge: true });
=======
      createdAt: serverTimestamp(), // Use Firestore server timestamp for consistent time
      isOnline: true, // Set user as online upon authentication
      lastSeen: serverTimestamp() // Record last seen timestamp
    }, { merge: true }); // Use merge: true to avoid overwriting existing fields
>>>>>>> ff3a45c164d25325c387c30b2402b81dbad2e8aa
  }

  /**
   * Updates the online/offline status of a user in Firestore.
   */
  async updateUserStatus(userId: string, isOnline: boolean): Promise<void> {
    const userDocRef = doc(this.firestore, `users/${userId}`);
    await setDoc(userDocRef, {
      isOnline: isOnline,
      lastSeen: serverTimestamp()
    }, { merge: true });
  }
<<<<<<< HEAD

  /**
   * Checks if the current user needs onboarding (new user without completed onboarding)
   */
  async needsOnboarding(): Promise<boolean> {
    const user = this.getCurrentUser();
    if (!user) return false;

    try {
      const userDocRef = doc(this.firestore, `users/${user.uid}`);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) return true;

      const userData = userSnap.data();
      return !userData['onboardingCompleted'];
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      return false;
    }
  }
=======
>>>>>>> ff3a45c164d25325c387c30b2402b81dbad2e8aa
}
