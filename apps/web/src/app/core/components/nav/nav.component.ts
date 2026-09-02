import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="fixed top-0 w-full z-50 bg-[#121A2B]/85 backdrop-blur-xl border-b border-[#1E293B] flex justify-between items-center h-16 px-4 md:px-12 max-w-full">
      <div class="flex items-center gap-8">
        <a routerLink="/" class="font-['Hanken_Grotesk'] text-xl font-bold text-white tracking-tighter hover:text-[#3B82F6] transition-colors">
          Technyks <span class="text-[#3B82F6]">Academy</span>
        </a>
        
        <div class="hidden md:flex gap-6 items-center ml-4">
          <a routerLink="/" routerLinkActive="text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-1" [routerLinkActiveOptions]="{exact: true}" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#d9c3af] hover:text-[#3B82F6] transition-colors">
            Home
          </a>

          <a routerLink="/courses" routerLinkActive="text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-1" [routerLinkActiveOptions]="{exact: false}" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#d9c3af] hover:text-[#3B82F6] transition-colors">
            Courses
          </a>
          
          <a routerLink="/membership" routerLinkActive="text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-1" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#d9c3af] hover:text-[#3B82F6] transition-colors">
            Membership
          </a>
          
          <a routerLink="/contact" routerLinkActive="text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-1" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#d9c3af] hover:text-[#3B82F6] transition-colors">
            Contact
          </a>
          
          @if (authService.isAdmin()) {
            <a routerLink="/admin" routerLinkActive="text-[#3B82F6] font-bold border-b-2 border-[#3B82F6] pb-1" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B82F6] hover:underline transition-colors flex items-center gap-1">
              <span class="material-symbols-outlined text-sm">admin_panel_settings</span>
              Admin
            </a>
          }
        </div>
      </div>

      <div class="flex items-center gap-4">
        <button
          type="button"
          class="theme-toggle inline-grid h-9 w-9 place-items-center transition-colors"
          (click)="themeService.toggle()"
          [attr.aria-label]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
          [title]="themeService.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode'"
        >
          <span class="material-symbols-outlined text-[19px]" aria-hidden="true">{{ themeService.isDarkMode() ? 'light_mode' : 'dark_mode' }}</span>
        </button>

        @if (authService.isAuthenticated()) {
          <div class="flex items-center gap-3">
            <a
              routerLink="/dashboard"
              class="profile-link"
              [attr.aria-label]="'Open dashboard for ' + (authService.currentUser()?.name || 'your account')"
              [title]="authService.currentUser()?.name || 'Open your dashboard'"
            >
              <span class="material-symbols-outlined text-[20px]">account_circle</span>
            </a>
            <button (click)="authService.logout()" class="font-['JetBrains_Mono'] text-xs uppercase text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab]/10 px-3 py-1.5 rounded transition-colors">
              Logout
            </button>
          </div>
        } @else {
          <a routerLink="/auth/login" class="hidden md:inline-block font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B82F6] border border-[#3B82F6] px-4 py-2 rounded hover:bg-[#3B82F6]/10 transition-colors">
            Login
          </a>
          <a routerLink="/auth/signup" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#3B82F6] px-4 py-2 rounded font-bold hover:bg-[#3B82F6]/90 transition-colors shadow-md">
            Start Learning
          </a>
        }
        
        <!-- Mobile Menu Toggle Button -->
        <button (click)="toggleMobileMenu()" class="md:hidden text-[#e0e3e5] focus:outline-none p-1">
          <span class="material-symbols-outlined">{{ isMobileMenuOpen() ? 'close' : 'menu' }}</span>
        </button>
      </div>
    </nav>

    <!-- Mobile Dropdown Navigation -->
    @if (isMobileMenuOpen()) {
      <div class="md:hidden fixed top-16 left-0 w-full bg-[#121A2B] border-b border-[#1E293B] z-40 p-6 flex flex-col gap-4 animate-in slide-in-from-top-2 duration-200">
        <a routerLink="/" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-[#d9c3af] hover:text-[#3B82F6] py-2 border-b border-[#1E293B]/50">
          Home
        </a>

        <a routerLink="/courses" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-[#d9c3af] hover:text-[#3B82F6] py-2 border-b border-[#1E293B]/50">
          Courses
        </a>
        <a routerLink="/membership" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-[#d9c3af] hover:text-[#3B82F6] py-2 border-b border-[#1E293B]/50">
          Membership
        </a>
        <a routerLink="/contact" (click)="closeMobileMenu()" class="font-['JetBrains_Mono'] text-sm uppercase text-[#d9c3af] hover:text-[#3B82F6] py-2 border-b border-[#1E293B]/50">
          Contact
        </a>
        @if (authService.isAuthenticated()) {
          <div class="pt-2 flex flex-col gap-3">
            <a routerLink="/dashboard" (click)="closeMobileMenu()" class="profile-link w-full rounded font-['JetBrains_Mono'] text-xs uppercase gap-2 py-2.5">
              <span class="material-symbols-outlined text-[20px]">account_circle</span>
              My dashboard
            </a>
            <button (click)="authService.logout(); closeMobileMenu()" class="text-center font-['JetBrains_Mono'] text-xs uppercase text-[#ffb4ab] border border-[#ffb4ab]/40 py-2.5 rounded">
              Logout
            </button>
          </div>
        } @else {
          <div class="flex flex-col gap-3 pt-2">
            <a routerLink="/auth/login" (click)="closeMobileMenu()" class="text-center font-['JetBrains_Mono'] text-xs uppercase text-[#3B82F6] border border-[#3B82F6] py-2.5 rounded">
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
