import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="not-found-container">
      <div class="not-found-content">
        <div class="error-icon">
          <span class="material-symbols-outlined">error</span>
        </div>
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-message">The page you're looking for doesn't exist.</p>
        <button class="btn btn-primary" (click)="goHome()">
          <span class="material-symbols-outlined">home</span>
          Go to Home
        </button>
      </div>
    </div>
  `,
  styles: [`
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--background-light);
      padding: var(--space-4);
    }

    .not-found-content {
      text-align: center;
      max-width: 400px;
    }

    .error-icon {
      font-size: 80px;
      color: var(--text-secondary-light);
      margin-bottom: var(--space-4);
    }

    .error-title {
      font-size: var(--font-size-header-lg);
      font-weight: 700;
      color: var(--text-primary-light);
      margin-bottom: var(--space-3);
    }

    .error-message {
      font-size: var(--font-size-body);
      color: var(--text-secondary-light);
      margin-bottom: var(--space-6);
      line-height: 1.5;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      padding: var(--space-3) var(--space-6);
      border: none;
      border-radius: var(--radius-lg);
      font-family: var(--font-family);
      font-size: var(--font-size-button);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .btn-primary {
      background-color: var(--primary-green);
      color: white;
      box-shadow: var(--shadow-sm);
    }

    .btn-primary:hover {
      background-color: var(--primary-green-600);
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }

    @media (prefers-color-scheme: dark) {
      .not-found-container {
        background-color: var(--background-dark);
      }

      .error-icon {
        color: var(--text-secondary-dark);
      }

      .error-title {
        color: var(--text-primary-dark);
      }

      .error-message {
        color: var(--text-secondary-dark);
      }
    }
  `]
})
export class NotFoundComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/home']);
  }
}
