import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-[85vh] flex flex-col justify-center items-center px-4 py-12">
      <div class="w-full max-w-md bg-[#121A2B] technical-border rounded p-8 shadow-2xl relative">
        <div class="flex items-center gap-2 mb-6">
          <span class="material-symbols-outlined text-[#E8931A]">person_add</span>
          <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#378ADD] tracking-widest font-semibold">// REGISTRATION</span>
        </div>

        <h1 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mb-2">Create Account</h1>
        <p class="font-['Inter'] text-sm text-[#d9c3af] mb-8">Join Technyks Academy to access engineering architecture tracks.</p>

        @if (errorMessage()) {
          <div class="mb-6 p-4 bg-[#690005]/40 border border-[#ffb4ab]/30 rounded text-[#ffdad6] text-xs font-['JetBrains_Mono'] flex items-center gap-2">
            <span class="material-symbols-outlined text-sm">error</span>
            {{ errorMessage() }}
          </div>
        }

        <form (ngSubmit)="onSignup()" class="flex flex-col gap-5">
          <div>
            <label class="block font-['JetBrains_Mono'] text-xs text-[#d9c3af] uppercase tracking-wider mb-2">Full Name</label>
            <input
              type="text"
              [(ngModel)]="name"
              name="name"
              required
              placeholder="Alex Rivers"
              class="w-full bg-[#040810] border border-[#1E293B] focus:border-[#E8931A] focus:outline-none rounded px-4 py-3 text-sm text-white font-['Inter'] transition-colors"
            />
          </div>

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
            <label class="block font-['JetBrains_Mono'] text-xs text-[#d9c3af] uppercase tracking-wider mb-2">Password</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              placeholder="At least 6 characters"
              class="w-full bg-[#040810] border border-[#1E293B] focus:border-[#E8931A] focus:outline-none rounded px-4 py-3 text-sm text-white font-['Inter'] transition-colors"
            />
          </div>

          <button
            type="submit"
            [disabled]="isLoading()"
            class="w-full mt-2 font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#E8931A] py-3.5 rounded font-bold hover:bg-[#E8931A]/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            @if (isLoading()) {
              <span class="material-symbols-outlined animate-spin text-sm">progress_activity</span> Creating Account...
            } @else {
              <span>Create Technyks Account</span>
              <span class="material-symbols-outlined text-sm">arrow_forward</span>
            }
          </button>
        </form>

        <p class="mt-8 text-center font-['Inter'] text-xs text-[#d9c3af]">
          Already registered?
          <a routerLink="/auth/login" class="font-['JetBrains_Mono'] text-[#E8931A] hover:underline font-semibold ml-1">Sign In</a>
        </p>
      </div>
    </div>
  `
})
export class SignupComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  isLoading = signal(false);
  errorMessage = signal('');

  onSignup() {
    if (!this.name || !this.email || !this.password) {
      this.errorMessage.set('Please fill out all required fields.');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.signup({ name: this.name, email: this.email, password: this.password }).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
      }
    });
  }
}
