import { Component, signal, OnInit, OnDestroy, AfterViewInit, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service'; 
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs'; 
import { skip } from 'rxjs/operators';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  phoneNumber = signal(''); 
  otp = signal(''); 
  showOtpInput = signal(false); 
  isLoading = signal(false); 
  countdown = signal(30);
  canResend = signal(true); 
  otpError = signal(''); 
  generalError = signal(''); 

  private userSubscription: Subscription | undefined;
  private countdownTimer: any;

  private authService: AuthService = inject(AuthService);
  private router: Router = inject(Router);
  
  constructor() {}

  ngOnInit(): void {
    // Uses skip(1) to prevent the redirect loop on logout
    this.userSubscription = this.authService.user$.pipe(skip(1)).subscribe(user => {
      if (user) {
        // **THE FIX**: Added a small delay before navigating.
        // This prevents a race condition where the component is destroyed
        // before the login process fully completes.
        setTimeout(() => {
          this.router.navigate(['/home']);
        }, 100); // 100ms delay is enough
      }
    });
  }

  ngAfterViewInit(): void {
    // Sets up a fresh reCAPTCHA instance every time the component view is ready
    this.authService.setupRecaptcha();
  }

  ngOnDestroy(): void {
    // Unsubscribe from the user observable to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
    // Clear the countdown timer
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
    // **CRUCIAL**: Clean up the reCAPTCHA instance when leaving the page
    this.authService.destroyRecaptcha();
  }

  async onGetOTP() {
    this.generalError.set(''); 
    this.otpError.set('');
    const phone = this.phoneNumber();
    const fullPhoneNumber = `+91${phone}`; 

    if (phone.length === 10) {
      this.isLoading.set(true);
      try {
        await this.authService.sendVerificationCode(fullPhoneNumber);
        this.showOtpInput.set(true);
        this.startCountdown();
        this.otp.set(''); 
      } catch (error: any) {
        console.error('Failed to send OTP:', error);
        this.generalError.set(error.message || 'Failed to send OTP. Please try again.');
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.generalError.set('Please enter a valid 10-digit phone number.');
    }
  }

  async onVerifyOTP() {
    this.otpError.set('');
    this.generalError.set('');
    const otpValue = this.otp();

    if (otpValue.length === 6) {
      this.isLoading.set(true);
      try {
        await this.authService.verifyOtp(otpValue);
        // The user$.subscribe in ngOnInit will handle navigation
      } catch (error: any) {
        console.error('Failed to verify OTP:', error);
        if (error.code === 'auth/invalid-verification-code') {
          this.otpError.set('Invalid OTP. Please try again.');
        } else if (error.code === 'auth/code-expired') {
            this.otpError.set('OTP expired. Please resend.');
        } else {
          this.otpError.set(error.message || 'OTP verification failed.');
        }
      } finally {
        this.isLoading.set(false);
      }
    } else {
      this.otpError.set('Please enter a 6-digit OTP.');
    }
  }

  async onResendOTP() {
    if (this.canResend() && !this.isLoading()) {
      this.onGetOTP();
    }
  }

  startCountdown() {
    this.canResend.set(false);
    this.countdown.set(30);

    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }

    this.countdownTimer = setInterval(() => {
      const current = this.countdown();
      if (current > 1) {
        this.countdown.set(current - 1);
      } else {
        this.canResend.set(true);
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
      }
    }, 1000);
  }

  onPhoneNumberChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 10);
    this.phoneNumber.set(value);
    input.value = value;
    this.generalError.set('');
  }

  onOtpChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(0, 6);
    this.otp.set(value);
    input.value = value;
    this.otpError.set('');
  }

  onBackToPhone() {
    this.showOtpInput.set(false);
    this.otp.set('');
    this.otpError.set('');
    this.generalError.set('');
    this.canResend.set(true);
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
      this.countdownTimer = null;
    }
    // Set up a new reCAPTCHA instance when the user goes back
    this.authService.setupRecaptcha();
  }
}
