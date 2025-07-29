import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
export class LoginComponent implements OnInit, OnDestroy, AfterViewInit {
  phoneNumber = signal(''); 
  otp = signal('');
  showOtpInput = signal(false); 
  isLoading = signal(false); 
=======
=======
>>>>>>> parent of 9d09627 (Firestore connected)
=======
>>>>>>> parent of 9d09627 (Firestore connected)
=======
>>>>>>> parent of ff3a45c (Merge pull request #1 from Ayush08k/authenticationAdd)
export class LoginComponent {
  phoneNumber = signal('');
  otp = signal('');
  showOtpInput = signal(false);
  isLoading = signal(false);
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
>>>>>>> parent of ff3a45c (Merge pull request #1 from Ayush08k/authenticationAdd)
=======
>>>>>>> parent of 9d09627 (Firestore connected)
=======
>>>>>>> parent of 9d09627 (Firestore connected)
=======
>>>>>>> parent of ff3a45c (Merge pull request #1 from Ayush08k/authenticationAdd)
  countdown = signal(30);
  canResend = signal(true);
  otpError = signal('');

  constructor(private router: Router) {}

  onGetOTP() {
    const phone = this.phoneNumber();
    if (phone.length === 10) {
      this.isLoading.set(true);

      // Simulate API call delay
      setTimeout(() => {
        this.isLoading.set(false);
        this.showOtpInput.set(true);
        this.startCountdown();
      }, 1500);
    }
  }

  onVerifyOTP() {
    const otpValue = this.otp();
    if (otpValue.length === 6) {
      this.isLoading.set(true);

      // Simulate OTP verification
      setTimeout(() => {
        this.isLoading.set(false);
        if (otpValue === '123456' || otpValue === '000000') {
          // Successful verification
          this.router.navigate(['/home']);
        } else {
          // Show error
          this.otpError.set('Invalid OTP. Try 123456 or 000000 for demo.');
          setTimeout(() => this.otpError.set(''), 3000);
        }
      }, 1000);
    }
  }

  onResendOTP() {
    if (this.canResend()) {
      this.otp.set('');
      this.otpError.set('');
      this.startCountdown();

      // Simulate resend API call
      this.isLoading.set(true);
      setTimeout(() => {
        this.isLoading.set(false);
      }, 1000);
    }
  }

  startCountdown() {
    this.canResend.set(false);
    this.countdown.set(30);

    const timer = setInterval(() => {
      const current = this.countdown();
      if (current > 0) {
        this.countdown.set(current - 1);
      } else {
        this.canResend.set(true);
        clearInterval(timer);
      }
    }, 1000);
  }

  onPhoneNumberChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Only allow digits and limit to 10 characters
    const value = input.value.replace(/\D/g, '').slice(0, 10);
    this.phoneNumber.set(value);
    input.value = value;
  }

  onOtpChange(event: Event) {
    const input = event.target as HTMLInputElement;
    // Only allow digits and limit to 6 characters
    const value = input.value.replace(/\D/g, '').slice(0, 6);
    this.otp.set(value);
    input.value = value;
    this.otpError.set(''); // Clear error when user types
  }

  onBackToPhone() {
    this.showOtpInput.set(false);
    this.otp.set('');
    this.otpError.set('');
    this.canResend.set(true);
  }
}
