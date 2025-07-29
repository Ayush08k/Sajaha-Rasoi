import { Component, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Firestore, doc, updateDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.css'
})
export class OnboardingComponent {
  name = signal('');
  isLoading = signal(false);
  error = signal('');

  private router: Router = inject(Router);
  private authService: AuthService = inject(AuthService);
  private firestore: Firestore = inject(Firestore);

  async onSubmit() {
    const nameValue = this.name().trim();
    
    if (nameValue.length < 2) {
      this.error.set('Please enter a valid name (at least 2 characters)');
      return;
    }

    this.isLoading.set(true);
    this.error.set('');

    try {
      const user = this.authService.getCurrentUser();
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Update user document in Firestore
      const userRef = doc(this.firestore, `users/${user.uid}`);
      await updateDoc(userRef, {
        displayName: nameValue,
        username: nameValue,
        onboardingCompleted: true,
        updatedAt: new Date()
      });

      // Navigate to home page
      this.router.navigate(['/home']);
    } catch (error: any) {
      console.error('Error saving user name:', error);
      this.error.set('Failed to save your name. Please try again.');
    } finally {
      this.isLoading.set(false);
    }
  }

  onNameChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.name.set(input.value);
    if (this.error()) {
      this.error.set('');
    }
  }
}
