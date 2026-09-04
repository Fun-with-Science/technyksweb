import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  host: { class: 'relative block' },
  template: `
    <nav class="relative w-full z-40 transition-colors duration-200 border-b flex justify-between items-center h-16 px-3 sm:px-5 md:px-8 xl:px-12 max-w-full backdrop-blur-xl bg-white/90 border-slate-200/80 text-slate-800 dark:bg-[#040810]/90 dark:border-white/10 dark:text-white shadow-sm">
      <div class="flex min-w-0 items-center gap-5 lg:gap-8">
        <a routerLink="/" class="min-w-0 font-['Hanken_Grotesk'] text-lg sm:text-xl font-bold tracking-tight transition-colors flex items-center gap-1 sm:gap-1.5 whitespace-nowrap">
          <span class="text-slate-900 dark:text-white">Technyks</span>
          <span class="hidden min-[390px]:inline text-[#2563EB] dark:text-[#3B82F6]">Academy</span>
        </a>
        
        <div class="hidden md:flex gap-6 items-center ml-4">
          <a routerLink="/" routerLinkActive="text-[#2563EB] dark:text-[#3B82F6] font-bold border-b-2 border-[#2563EB] dark:border-[#3B82F6]" [routerLinkActiveOptions]="{exact: true}" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-slate-600 hover:text-[#2563EB] dark:text-slate-300 dark:hover:text-[#3B82F6] pb-1 transition-colors">
            Home
          </a>

          <a routerLink="/courses" routerLinkActive="text-[#2563EB] dark:text-[#3B82F6] font-bold border-b-2 border-[#2563EB] dark:border-[#3B82F6]" [routerLinkActiveOptions]="{exact: false}" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-slate-600 hover:text-[#2563EB] dark:text-slate-300 dark:hover:text-[#3B82F6] pb-1 transition-colors">
            Courses
          </a>
          
          <a routerLink="/membership" routerLinkActive="text-[#2563EB] dark:text-[#3B82F6] font-bold border-b-2 border-[#2563EB] dark:border-[#3B82F6]" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-slate-600 hover:text-[#2563EB] dark:text-slate-300 dark:hover:text-[#3B82F6] pb-1 transition-colors">
            Membership
          </a>
          
          <a routerLink="/contact" routerLinkActive="text-[#2563EB] dark:text-[#3B82F6] font-bold border-b-2 border-[#2563EB] dark:border-[#3B82F6]" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-slate-600 hover:text-[#2563EB] dark:text-slate-300 dark:hover:text-[#3B82F6] pb-1 transition-colors">
            Contact
          </a>
          
          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="text-[#2563EB] dark:text-[#3B82F6] font-bold border-b-2 border-[#2563EB] dark:border-[#3B82F6]" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-slate-600 hover:text-[#2563EB] dark:text-slate-300 dark:hover:text-[#3B82F6] pb-1 transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-[16px]">headphones</span>
              Admin
            </a>
          }
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2 sm:gap-3 md:gap-4">
        <!-- Theme Toggle Button -->
        <button
          type="button"
          class="inline-grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:border-[#2563EB] bg-white transition-all dark:border-white/15 dark:text-slate-300 dark:bg-[#0b101d] dark:hover:text-white dark:hover:border-white/30 shadow-sm"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
          [title]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="material-symbols-outlined text-[18px]" aria-hidden="true">{{ themeService.isDarkMode() ? 'dark_mode' : 'light_mode' }}</span>
        </button>

        <!-- Profile Avatar Button -->
        <a
          routerLink="/dashboard"
          class="hidden md:inline-grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:border-[#2563EB] bg-white transition-all dark:border-white/15 dark:text-slate-300 dark:bg-[#0b101d] dark:hover:text-white dark:hover:border-white/30 shadow-sm"
          [attr.aria-label]="'Open dashboard for ' + (authService.currentUser()?.name || 'your account')"
          [title]="authService.currentUser()?.name || 'Open your dashboard'"
        >
          <span class="material-symbols-outlined text-[19px]">account_circle</span>
        </a>

        <!-- Auth Button (LOGOUT / LOGIN) -->
        @if (authService.isAuthenticated()) {
          <button
            (click)="authService.logout()"
            class="hidden md:inline-flex font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-bold !text-white px-5 py-2.5 rounded-lg transition-all shadow-sm bg-[#2563EB] hover:bg-[#1D4ED8]"
          >
            Logout
          </button>
        } @else {
          <a
            routerLink="/auth/login"
            class="hidden md:inline-flex font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-bold !text-white px-5 py-2.5 rounded-lg transition-all shadow-sm bg-[#2563EB] hover:bg-[#1D4ED8]"
          >
            Login
          </a>
        }
        
        <!-- Mobile Menu Toggle Button -->
        <button (click)="toggleMobileMenu()" [attr.aria-expanded]="isMobileMenuOpen()" aria-label="Toggle navigation menu" class="md:hidden inline-grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-700 dark:border-white/15 dark:text-slate-200 focus:outline-none">
          <span class="material-symbols-outlined">{{ isMobileMenuOpen() ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </nav>

    <!-- Mobile Dropdown Navigation -->
    @if (isMobileMenuOpen()) {
      <div class="md:hidden absolute top-full left-0 w-full bg-white dark:bg-[#121A2B] border-b border-slate-200 dark:border-[#1E293B] z-40 px-5 py-4 flex flex-col gap-2 animate-in slide-in-from-top-2 duration-200 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
        <a routerLink="/" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-slate-700 dark:text-[#d9c3af] hover:text-[#2563EB] py-2 border-b border-slate-100 dark:border-[#1E293B]/50">
          Home
        </a>
        <a routerLink="/courses" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-slate-700 dark:text-[#d9c3af] hover:text-[#2563EB] py-2 border-b border-slate-100 dark:border-[#1E293B]/50">
          Courses
        </a>
        <a routerLink="/membership" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-slate-700 dark:text-[#d9c3af] hover:text-[#2563EB] py-2 border-b border-slate-100 dark:border-[#1E293B]/50">
          Membership
        </a>
        <a routerLink="/contact" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-slate-700 dark:text-[#d9c3af] hover:text-[#2563EB] py-2 border-b border-slate-100 dark:border-[#1E293B]/50">
          Contact
        </a>
        @if (authService.isAdmin()) {
          <a routerLink="/admin" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-slate-700 dark:text-[#d9c3af] hover:text-[#2563EB] py-2 border-b border-slate-100 dark:border-[#1E293B]/50 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">headphones</span>
            Admin
          </a>
        }

        @if (authService.isAuthenticated()) {
          <div class="pt-2 flex flex-col gap-3">
            <a routerLink="/dashboard" (click)="closeMobileMenu()" class="text-slate-700 dark:text-slate-200 font-['JetBrains_Mono'] text-xs uppercase flex items-center gap-2 py-2">
              <span class="material-symbols-outlined text-[20px]">account_circle</span>
              My dashboard
            </a>
            <button (click)="authService.logout(); closeMobileMenu()" class="text-center font-['JetBrains_Mono'] text-xs uppercase text-red-500 border border-red-300 dark:border-red-500/40 py-2.5 rounded-full">
              Logout
            </button>
          </div>
        } @else {
          <div class="flex flex-col gap-3 pt-2">
            <a routerLink="/auth/login" (click)="closeMobileMenu()" class="text-center font-['JetBrains_Mono'] text-xs uppercase text-white bg-[#1D4ED8] py-2.5 rounded-full">
              Login
            </a>
          </div>
        }
      </div>
    }
  `
})
export class NavComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);
  isMobileMenuOpen = signal<boolean>(false);

  toggleMobileMenu() {
    this.isMobileMenuOpen.update(val => !val);
  }

  closeMobileMenu() {
    this.isMobileMenuOpen.set(false);
  }
}
