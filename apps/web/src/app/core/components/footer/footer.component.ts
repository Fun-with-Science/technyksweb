import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="w-full bg-[#0b0f10] border-t border-[#1E293B] grid grid-cols-1 md:grid-cols-4 gap-8 px-6 md:px-16 py-16 mt-auto">
      <div class="md:col-span-1">
        <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mb-4">Technyks Academy</h2>
        <p class="font-['Inter'] text-sm text-[#d9c3af] mb-6">
          © 2026 Technyks Academy. Code is easy. Architecture is hard.
        </p>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#E8931A] tracking-wider mb-2">Connect</h3>
        <a href="https://youtube.com" target="_blank" rel="noopener" class="font-['JetBrains_Mono'] text-xs text-[#d9c3af] hover:text-[#E8931A] transition-colors">YouTube</a>
        <a href="https://instagram.com" target="_blank" rel="noopener" class="font-['JetBrains_Mono'] text-xs text-[#d9c3af] hover:text-[#E8931A] transition-colors">Instagram</a>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#E8931A] tracking-wider mb-2">Platform</h3>
        <a routerLink="/courses" class="font-['JetBrains_Mono'] text-xs text-[#d9c3af] hover:text-[#E8931A] transition-colors">Course Catalog</a>
        <a routerLink="/membership" class="font-['JetBrains_Mono'] text-xs text-[#d9c3af] hover:text-[#E8931A] transition-colors">Membership Plans</a>
        <a href="#" class="font-['JetBrains_Mono'] text-xs text-[#d9c3af] hover:text-[#E8931A] transition-colors">Sitemap</a>
      </div>

      <div class="flex flex-col gap-3">
        <h3 class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#E8931A] tracking-wider mb-2">Legal</h3>
        <a href="#" class="font-['JetBrains_Mono'] text-xs text-[#d9c3af] hover:text-[#E8931A] transition-colors">Privacy Policy</a>
        <a href="#" class="font-['JetBrains_Mono'] text-xs text-[#d9c3af] hover:text-[#E8931A] transition-colors">Terms of Service</a>
      </div>
    </footer>
  `
})
export class FooterComponent {}
