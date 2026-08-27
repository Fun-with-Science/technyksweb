import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-membership',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-6 md:px-16 pt-24 pb-20 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="text-center max-w-3xl mx-auto mb-16">
        <div class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#E8931A] px-3.5 py-1.5 border border-[#E8931A]/30 bg-[#E8931A]/10 rounded-full w-fit mb-4">
          <span class="material-symbols-outlined text-[16px]">workspace_premium</span>
          UNLIMITED ACCESS TO ARCHITECTURE
        </div>
        <h1 class="font-['Hanken_Grotesk'] text-4xl md:text-5xl font-bold text-white mb-4">Join Technyks Academy Membership</h1>
        <p class="font-['Inter'] text-base md:text-lg text-[#d9c3af]">
          Get full access to all existing and future architecture tracks, code repositories, private Discord community, and auto-generated certificates.
        </p>

        <!-- Interval Switcher -->
        <div class="inline-flex items-center bg-[#121A2B] technical-border p-1.5 rounded-full mt-8">
          <button
            (click)="isAnnual.set(false)"
            [class.bg-[#E8931A]]="!isAnnual()"
            [class.text-[#040810]]="!isAnnual()"
            [class.font-bold]="!isAnnual()"
            [class.text-[#d9c3af]]="isAnnual()"
            class="font-['JetBrains_Mono'] text-xs uppercase px-6 py-2 rounded-full transition-all"
          >
            Monthly Billing
          </button>
          <button
            (click)="isAnnual.set(true)"
            [class.bg-[#E8931A]]="isAnnual()"
            [class.text-[#040810]]="isAnnual()"
            [class.font-bold]="isAnnual()"
            [class.text-[#d9c3af]]="!isAnnual()"
            class="font-['JetBrains_Mono'] text-xs uppercase px-6 py-2 rounded-full transition-all flex items-center gap-2"
          >
            Annual Billing
            <span class="bg-[#378ADD] text-white text-[10px] px-2 py-0.5 rounded-full">SAVE 33%</span>
          </button>
        </div>
      </div>

      <!-- RBI Compliance Note for Indian Users -->
      <div class="mb-12 max-w-4xl mx-auto p-4 bg-[#121A2B] border border-[#378ADD]/40 rounded text-xs font-['JetBrains_Mono'] text-[#a1c9ff] flex items-center gap-3">
        <span class="material-symbols-outlined text-xl text-[#378ADD]">security</span>
        <div>
          <span class="font-bold uppercase text-[#E8931A]">RBI Compliance Guaranteed:</span> Indian card and UPI Autopay / e-mandate transactions follow strict RBI authentication protocols with pre-debit notifications sent 24h prior to any renewal.
        </div>
      </div>

      <!-- Pricing Cards Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
        <!-- Free Tier -->
        <div class="bg-[#121A2B] technical-border rounded p-8 flex flex-col justify-between">
          <div>
            <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#a18d7b] font-bold">STARTER</span>
            <h3 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mt-1 mb-4">Free Tier</h3>
            <div class="font-['JetBrains_Mono'] text-4xl font-bold text-white mb-6">₹0 <span class="text-xs text-[#a18d7b] font-normal">/ forever</span></div>

            <ul class="flex flex-col gap-3 font-['Inter'] text-sm text-[#d9c3af] mb-8">
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#378ADD] text-base">check</span> Free preview lessons
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#378ADD] text-base">check</span> Technyks Newsletter & Articles
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#378ADD] text-base">check</span> Public GitHub Repositories
              </li>
            </ul>
          </div>

          <a routerLink="/auth/signup" class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#378ADD] border border-[#378ADD] py-3.5 rounded font-semibold hover:bg-[#378ADD]/10 transition-colors">
            Get Started Free
          </a>
        </div>

        <!-- Pro Monthly -->
        <div class="bg-[#121A2B] border-2 border-[#378ADD] rounded p-8 flex flex-col justify-between relative shadow-2xl">
          <div>
            <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#378ADD] font-bold">POPULAR</span>
            <h3 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mt-1 mb-4">Pro Monthly</h3>
            <div class="font-['JetBrains_Mono'] text-4xl font-bold text-white mb-6">
              ₹{{ isAnnual() ? '999' : '1,499' }}
              <span class="text-xs text-[#a18d7b] font-normal">/ month</span>
            </div>

            <ul class="flex flex-col gap-3 font-['Inter'] text-sm text-[#d9c3af] mb-8">
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">check_circle</span> Access to ALL Architecture Tracks
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">check_circle</span> Full Nx & NestJS Source Code
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">check_circle</span> Private Discord Engineering Guild
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">check_circle</span> Cancel Anytime
              </li>
            </ul>
          </div>

          <a
            routerLink="/checkout"
            [queryParams]="{ planSlug: 'pro-monthly' }"
            class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#E8931A] py-4 rounded font-bold hover:bg-[#E8931A]/90 transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            Join Pro Membership
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>

        <!-- All-Access Annual -->
        <div class="bg-[#121A2B] technical-border rounded p-8 flex flex-col justify-between relative">
          <div class="absolute -top-3 right-6 bg-[#E8931A] text-[#040810] font-['JetBrains_Mono'] text-[10px] font-bold px-3 py-1 rounded-full uppercase">
            BEST VALUE
          </div>

          <div>
            <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#E8931A] font-bold">ANNUAL VIP</span>
            <h3 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mt-1 mb-4">All-Access Annual</h3>
            <div class="font-['JetBrains_Mono'] text-4xl font-bold text-white mb-6">
              ₹11,999
              <span class="text-xs text-[#a18d7b] font-normal">/ year</span>
            </div>

            <ul class="flex flex-col gap-3 font-['Inter'] text-sm text-[#d9c3af] mb-8">
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">verified</span> Everything in Pro Monthly
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">verified</span> Auto-Generated Completion Certificates
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">verified</span> 1-on-1 Code & Architecture Review
              </li>
              <li class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[#E8931A] text-base">verified</span> Guaranteed RBI UPI Autopay / e-mandate
              </li>
            </ul>
          </div>

          <a
            routerLink="/checkout"
            [queryParams]="{ planSlug: 'all-access-annual' }"
            class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#378ADD] border border-[#378ADD] py-4 rounded font-bold hover:bg-[#378ADD]/10 transition-colors flex items-center justify-center gap-2"
          >
            Join Annual VIP
            <span class="material-symbols-outlined text-sm">arrow_forward</span>
          </a>
        </div>
      </div>
    </div>
  `
})
export class MembershipComponent {
  isAnnual = signal(true);
}
