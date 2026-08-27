import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div class="w-full max-w-md bg-[#121A2B] technical-border rounded p-8 shadow-2xl relative">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-[#E8931A]">lock</span>
          <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#378ADD] tracking-widest font-semibold">// AUTHENTICATION</span>
        </div>

        <h1 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mb-2">Access Console</h1>
        <p class="font-['Inter'] text-sm text-[#d9c3af] mb-8">Sign in to your Technyks Academy account to resume your tracks.</p>

        @if (errorMessage()) {
          <div class="mb-6 p-4 bg-[#690005]/40 border border-[#ffb4ab]/30 rounded text-[#ffdad6] text-xs font-['JetBrains_Mono'] flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">error</span>
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onLogin()" class="flex flex-col gap-5">
          <div>
            <label class="block font-['JetBrains_Mono'] text-xs text-[#d9c3af] uppercase tracking-wider mb-2">Email Address</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              placeholder="architect@technyks.com"
              class="w-full bg-[#040810] border border-[#1E293B] focus:border-[#E8931A] focus:outline-none rounded px-4 py-3 text-sm text-white font-['Inter'] transition-colors"
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="block font-['JetBrains_Mono'] text-xs text-[#d9c3af] uppercase tracking-wider">Password</label>
              <a routerLink="/auth/forgot-password" class="font-['JetBrains_Mono'] text-xs text-[#378ADD] hover:underline">Forgot password?</a>
            </div>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="••••••••••••"
              class="w-full bg-[#040810] border border-[#1E293B] focus:border-[#E8931A] focus:outline-none rounded px-4 py-3 text-sm text-white font-['Inter'] transition-colors"
            />
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full mt-2 font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#E8931A] py-3.5 rounded font-bold hover:bg-[#E8931A]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            @if (isLoading()) {
              <span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Authenticating...
            } @else {
              <span>Sign In to Console</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            }
          </button>
        </form>

        <div class="relative my-6 text-center">
          <div class="absolute inset-0 flex items-center"><div class="w-full border-t border-[#1E293B]"></div></div>
          <span class="relative bg-[#121A2B] px-4 font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase">OR</span>
        </div>

        <button
          (click)="onGoogleLogin()"
          type="button"
          class="w-full font-['JetBrains_Mono'] text-xs text-white border border-[#1E293B] hover:border-[#378ADD] py-3 rounded flex items-center justify-center gap-3 transition-all bg-[#040810]"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"/>
            <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"/>
            <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 10.8 0 12s.7 2.3 1.9 4.7l3.7-2.9z"/>
            <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"/>
          </svg>
          Continue with Google
        </button>

        <p class="mt-8 text-center font-['Inter'] text-xs text-[#d9c3af]">
          Don't have an account?
          <a routerLink="/auth/signup" class="font-['JetBrains_Mono'] text-[#E8931A] hover:underline font-semibold ml-1">Create Account</a>
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  onLogin() {
    if (!this.email || !this.password) {
      this.errorMessage.set('Please provide both email and password.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Authentication failed. Please check your credentials.');
      }
    });
  }

  onGoogleLogin() {
    // Simulated Google OAuth login flow
    this.isLoading.set(true);
    this.authService.login({ email: 'google.architect@technyks.com', googleId: 'google_oauth_12345' }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        // Create user if not exists
        this.authService.signup({ email: 'google.architect@technyks.com', name: 'Senior Engineer', googleId: 'google_oauth_12345' }).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.isLoading.set(false);
            this.errorMessage.set(err.error?.message || 'Google authentication failed.');
          }
        });
      }
    });
  }
}
