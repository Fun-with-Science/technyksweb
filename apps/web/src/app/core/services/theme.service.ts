import { Injectable, signal } from '@angular/core';

const THEME_STORAGE_KEY = 'technyks-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  isDarkMode = signal(this.readStoredTheme());
  private systemTheme?: MediaQueryList;

  constructor() {
    this.applyTheme(this.isDarkMode());
    this.followSystemThemeUntilOverridden();
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
    if (typeof window === 'undefined') return false;
    try {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme) return storedTheme === 'dark';
      return typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    } catch {
      return typeof window.matchMedia === 'function'
        ? window.matchMedia('(prefers-color-scheme: dark)').matches
        : false;
    }
  }

  private followSystemThemeUntilOverridden() {
    if (
      typeof window === 'undefined' ||
      typeof window.matchMedia !== 'function'
    )
      return;
    try {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
      this.systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemTheme.addEventListener('change', (event) => {
        if (localStorage.getItem(THEME_STORAGE_KEY)) return;
        this.isDarkMode.set(event.matches);
        this.applyTheme(event.matches);
      });
    } catch {
      // The initial theme remains active when media-query listeners are unavailable.
    }
  }

  private applyTheme(isDark: boolean) {
    if (typeof document === 'undefined') return;
    const docEl = document.documentElement;
    const body = document.body;
    docEl.classList.remove('theme-pending');

    if (isDark) {
      docEl.classList.add('dark', 'dark-theme');
      docEl.classList.remove('light-theme');
      body?.classList.add('dark', 'dark-theme');
      body?.classList.remove('light-theme');
    } else {
      docEl.classList.remove('dark', 'dark-theme');
      docEl.classList.add('light-theme');
      body?.classList.remove('dark', 'dark-theme');
      body?.classList.add('light-theme');
    }
  }
}
