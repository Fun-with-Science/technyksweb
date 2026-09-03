import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="w-full bg-white dark:bg-[#0b0f10] border-t border-slate-200 dark:border-[#1E293B] grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-16 py-16 mt-auto transition-colors">
      <div class="md:col-span-1">
        <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-slate-900 dark:text-white mb-2">Technyks Academy</h2>
        <p class="font-['Inter'] text-xs text-slate-500 dark:text-[#d9c3af] mb-4 leading-relaxed">
          Master Full Stack, AI & Autonomous Agents with production-grade engineering courses.
        </p>
        <p class="font-['JetBrains_Mono'] text-[11px] text-slate-400 dark:text-[#a18d7b]">
          © 2026 Technyks Academy. All rights reserved.
        </p>
      </div>

      <div class="flex flex-col gap-2.5">
        <h3 class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider mb-1">Platform</h3>
        <a routerLink="/courses" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">Course Catalog</a>
        <a routerLink="/membership" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">Membership Plans</a>
        <a routerLink="/contact" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">Support & Contact</a>
      </div>

      <div class="flex flex-col gap-2.5">
        <h3 class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider mb-1">Legal & Policies</h3>
        <a routerLink="/privacy-policy" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">Privacy Policy</a>
        <a routerLink="/terms-and-conditions" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">Terms & Conditions</a>
        <a routerLink="/refund-policy" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors">Cancellation & Refund</a>
      </div>

      <div class="flex flex-col gap-2.5">
        <h3 class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#2563EB] dark:text-[#3B82F6] tracking-wider mb-1">Connect</h3>
        <a href="https://youtube.com/@funwithscience" target="_blank" rel="noopener noreferrer" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors flex items-center gap-1.5">
          <span>YouTube</span>
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="font-['JetBrains_Mono'] text-xs text-slate-600 dark:text-[#d9c3af] hover:text-[#2563EB] dark:hover:text-[#3B82F6] transition-colors flex items-center gap-1.5">
          <span>Instagram</span>
          <span class="material-symbols-outlined text-[14px]">open_in_new</span>
        </a>
      </div>
    </footer>
  `
})
export class FooterComponent {}
