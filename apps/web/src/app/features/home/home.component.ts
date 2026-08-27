import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="flex flex-col gap-20 pb-20 pt-16">
      <!-- Hero Section -->
      <section class="min-h-[75vh] flex flex-col justify-center px-6 md:px-16 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-b from-[#121A2B]/30 to-transparent pointer-events-none"></div>
        
        <div class="max-w-4xl relative z-10 grid gap-8 mt-12 md:mt-0">
          <div class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#378ADD] px-3.5 py-1.5 border border-[#378ADD]/30 bg-[#378ADD]/10 rounded-full w-fit">
            <span class="material-symbols-outlined text-[16px]">terminal</span>
            v2.0 Architecture Track Live
          </div>
          
          <h1 class="font-['Hanken_Grotesk'] text-4xl sm:text-6xl md:text-[72px] leading-[1.1] font-bold text-white tracking-tight">
            Code is easy.<br />
            <span class="text-[#E8931A]">Architecture is hard.</span>
          </h1>
          
          <p class="font-['Inter'] text-lg text-[#d9c3af] max-w-2xl border-l-2 border-[#1E293B] pl-4 leading-relaxed">
            Elevate your engineering from building features to designing scalable, resilient systems. Premium training for senior developers focused on Full-Stack, AI, and Angular architecture.
          </p>
          
          <div class="flex flex-wrap gap-4 mt-2">
            <a routerLink="/courses" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#E8931A] px-8 py-4 rounded font-bold hover:scale-[0.98] transition-all flex items-center gap-2 shadow-lg">
              View All Tracks
              <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
            
            <a routerLink="/membership" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#378ADD] border border-[#378ADD] px-8 py-4 rounded hover:bg-[#378ADD]/10 transition-colors flex items-center gap-2">
              <span class="material-symbols-outlined text-[18px]">workspace_premium</span>
              Explore Membership
            </a>
          </div>
        </div>

        <!-- Technical Schematic Decorative SVG -->
        <div class="absolute right-12 top-1/2 -translate-y-1/2 hidden lg:block opacity-20 pointer-events-none">
          <svg fill="none" height="400" viewBox="0 0 400 400" width="400" xmlns="http://www.w3.org/2000/svg">
            <circle cx="200" cy="200" r="199.5" stroke="#378ADD" stroke-dasharray="4 4"></circle>
            <circle cx="200" cy="200" r="149.5" stroke="#378ADD" stroke-dasharray="4 4"></circle>
            <line stroke="#378ADD" stroke-dasharray="4 4" x1="200" x2="200" y1="0" y2="400"></line>
            <line stroke="#378ADD" stroke-dasharray="4 4" x1="0" x2="400" y1="200" y2="200"></line>
          </svg>
        </div>
      </section>

      <!-- Featured Tracks Highlights Grid -->
      <section class="px-6 md:px-16">
        <div class="flex items-center justify-between mb-8 border-b border-[#1E293B] pb-4">
          <div>
            <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#E8931A] tracking-widest font-semibold">// CURRICULUM</span>
            <h2 class="font-['Hanken_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1">Featured Architecture Tracks</h2>
          </div>
          <a routerLink="/courses" class="hidden sm:flex font-['JetBrains_Mono'] text-xs text-[#378ADD] hover:underline items-center gap-1">
            Browse Catalog <span class="material-symbols-outlined text-sm">chevron_right</span>
          </a>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="bg-[#121A2B] technical-border rounded flex flex-col justify-between overflow-hidden group hover:border-[#378ADD] transition-all shadow-xl">
            <div class="relative w-full h-44 overflow-hidden border-b border-[#1E293B]">
              <img src="/assets/agentic-ai.jpg" alt="Mastering Agentic AI" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#121A2B] via-transparent to-transparent opacity-80"></div>
              <span class="absolute top-3 left-3 font-['JetBrains_Mono'] text-[10px] text-[#378ADD] bg-[#040810]/90 backdrop-blur-md px-2.5 py-1 border border-[#378ADD]/40 rounded">v2.1.0</span>
              <span class="absolute top-3 right-3 font-['JetBrains_Mono'] text-[10px] text-[#E8931A] bg-[#040810]/90 backdrop-blur-md border border-[#E8931A]/40 px-2.5 py-1 rounded font-semibold uppercase">ALL-ACCESS</span>
            </div>

            <div class="p-6">
              <h3 class="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-2 group-hover:text-[#E8931A] transition-colors">Mastering Agentic AI</h3>
              <p class="font-['Inter'] text-sm text-[#d9c3af] mb-6">Build autonomous LLM agents, tool-calling pipelines, and multi-agent systems with NestJS and Python.</p>
            </div>
            
            <div class="p-6 pt-0 mt-auto flex items-center justify-between border-t border-[#1E293B]/40 bg-[#0b0f10]/40">
              <a routerLink="/courses/mastering-agentic-ai" class="font-['JetBrains_Mono'] text-xs font-bold text-[#378ADD] flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Track <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

          <div class="bg-[#121A2B] technical-border rounded flex flex-col justify-between overflow-hidden group hover:border-[#378ADD] transition-all shadow-xl">
            <div class="relative w-full h-44 overflow-hidden border-b border-[#1E293B]">
              <img src="/assets/architectural-intelligence.jpg" alt="Architectural Intelligence" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#121A2B] via-transparent to-transparent opacity-80"></div>
              <span class="absolute top-3 left-3 font-['JetBrains_Mono'] text-[10px] text-[#378ADD] bg-[#040810]/90 backdrop-blur-md px-2.5 py-1 border border-[#378ADD]/40 rounded">v1.8.4</span>
              <span class="absolute top-3 right-3 font-['JetBrains_Mono'] text-[10px] text-[#E8931A] bg-[#040810]/90 backdrop-blur-md border border-[#E8931A]/40 px-2.5 py-1 rounded font-semibold uppercase">PRO TRACK</span>
            </div>

            <div class="p-6">
              <h3 class="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-2 group-hover:text-[#E8931A] transition-colors">Architectural Intelligence</h3>
              <p class="font-['Inter'] text-sm text-[#d9c3af] mb-6">Master Nx monorepos, domain-driven design (DDD), micro-frontends, and Angular state signals.</p>
            </div>
            
            <div class="p-6 pt-0 mt-auto flex items-center justify-between border-t border-[#1E293B]/40 bg-[#0b0f10]/40">
              <a routerLink="/courses/architectural-intelligence" class="font-['JetBrains_Mono'] text-xs font-bold text-[#378ADD] flex items-center gap-1 group-hover:gap-2 transition-all">
                Explore Track <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>

          <div class="bg-[#121A2B] technical-border rounded flex flex-col justify-between overflow-hidden group hover:border-[#378ADD] transition-all shadow-xl">
            <div class="relative w-full h-44 overflow-hidden border-b border-[#1E293B]">
              <img src="/assets/saas-blueprint.jpg" alt="Full-Stack SaaS Blueprint" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div class="absolute inset-0 bg-gradient-to-t from-[#121A2B] via-transparent to-transparent opacity-80"></div>
              <span class="absolute top-3 left-3 font-['JetBrains_Mono'] text-[10px] text-[#378ADD] bg-[#040810]/90 backdrop-blur-md px-2.5 py-1 border border-[#378ADD]/40 rounded">v3.0.0</span>
              <span class="absolute top-3 right-3 font-['JetBrains_Mono'] text-[10px] text-[#E8931A] bg-[#040810]/90 backdrop-blur-md border border-[#E8931A]/40 px-2.5 py-1 rounded font-semibold uppercase">MEMBERSHIP</span>
            </div>

            <div class="p-6">
              <h3 class="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-2 group-hover:text-[#E8931A] transition-colors">Full-Stack SaaS Blueprint</h3>
              <p class="font-['Inter'] text-sm text-[#d9c3af] mb-6">End-to-end LMS, Razorpay/Lemon Squeezy integration, video tokenization, and PostgreSQL schemas.</p>
            </div>
            
            <div class="p-6 pt-0 mt-auto flex items-center justify-between border-t border-[#1E293B]/40 bg-[#0b0f10]/40">
              <a routerLink="/membership" class="font-['JetBrains_Mono'] text-xs font-bold text-[#378ADD] flex items-center gap-1 group-hover:gap-2 transition-all">
                Join Membership <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent {}
