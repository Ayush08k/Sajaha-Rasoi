import { Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark' | 'auto';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'saajha-rasoi-theme';
  
  // Current theme state
  currentTheme = signal<Theme>('dark');
  
  // Computed state for actual applied theme
  isDarkMode = signal<boolean>(false);

  constructor() {
    this.initializeTheme();
    this.setupMediaQueryListener();
  }

  private initializeTheme(): void {
    // Get saved theme from localStorage or default to 'auto'
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme;
    const initialTheme = savedTheme || 'dark';
    
    this.currentTheme.set(initialTheme);
    this.applyTheme(initialTheme);
  }

  private setupMediaQueryListener(): void {
    // Listen for system theme changes when in auto mode
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      if (this.currentTheme() === 'auto') {
        this.isDarkMode.set(e.matches);
        this.updateDocumentTheme(e.matches);
      }
    });
  }

  toggleTheme(): void {
    const current = this.currentTheme();
    let nextTheme: Theme;
    
    switch (current) {
      case 'light':
        nextTheme = 'dark';
        break;
      case 'dark':
        nextTheme = 'auto';
        break;
      case 'auto':
      default:
        nextTheme = 'light';
        break;
    }
    
    this.setTheme(nextTheme);
  }

  setTheme(theme: Theme): void {
    this.currentTheme.set(theme);
    this.applyTheme(theme);
    localStorage.setItem(this.THEME_KEY, theme);
  }

  private applyTheme(theme: Theme): void {
    let isDark: boolean;
    
    switch (theme) {
      case 'light':
        isDark = false;
        break;
      case 'dark':
        isDark = true;
        break;
      case 'auto':
      default:
        isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        break;
    }
    
    this.isDarkMode.set(isDark);
    this.updateDocumentTheme(isDark);
  }

  private updateDocumentTheme(isDark: boolean): void {
    const body = document.body;
    const html = document.documentElement;
    
    if (isDark) {
      body.classList.add('dark-theme');
      html.classList.add('dark-theme');
      body.classList.remove('light-theme');
      html.classList.remove('light-theme');
    } else {
      body.classList.add('light-theme');
      html.classList.add('light-theme');
      body.classList.remove('dark-theme');
      html.classList.remove('dark-theme');
    }
  }

  getThemeIcon(): string {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light':
        return 'assets/Icon/logo-light.png';
      case 'dark':
        return 'assets/Icon/logo-dark.png';
      case 'auto':
      default:
        return 'assets/Icon/logo-auto.png';
    }
  }

  getThemeLogoPath(): string {
    // Using the existing mode.png icon for all theme states
    return 'assets/Icon/logo-auto.png';
  }

  getThemeLabel(): string {
    const theme = this.currentTheme();
    switch (theme) {
      case 'light': return 'Switch to Dark Mode';
      case 'dark': return 'Switch to Auto Mode';
      case 'auto': default: return 'Switch to Light Mode';
    }
  }
}
