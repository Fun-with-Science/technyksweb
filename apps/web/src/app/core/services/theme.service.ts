import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'technyks-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(this.readStoredTheme());

  constructor() {
    this.applyTheme(this.isDarkMode());
  }

  toggle() {
    this.setDarkMode(!this.isDarkMode());
  }

  setDarkMode(isDark: boolean) {
    this.isDarkMode.set(isDark);
    this.applyTheme(isDark);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // The visual switch still works if browser storage is unavailable.
    }
  }

  private readStoredTheme(): boolean {
    // Dark mode is the first-visit default. Once a learner chooses a theme,
    // their explicit preference remains the source of truth on later visits.
    if (typeof localStorage === 'undefined') return true;
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return storedTheme ? storedTheme === 'dark' : true;
    } catch {
      return true;
    }
  }

  private applyTheme(isDark: boolean) {
    if (typeof document === 'undefined') return;
    document.documentElement.classList.toggle('dark-theme', isDark);
    document.body?.classList.toggle('dark-theme', isDark);
  }
}
