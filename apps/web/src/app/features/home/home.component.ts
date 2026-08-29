import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course, CoursesService } from '../../core/services/courses.service';
import { CourseCardComponent } from '../../core/components/course-card/course-card.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CourseCardComponent],
  template: `
    <div class="flex flex-col gap-24 pb-20 pt-16">
      <!-- Hero Section -->
      <section
        class="hero-section min-h-[75vh] flex flex-col justify-center items-center px-6 md:px-16 relative overflow-hidden text-center"
      >
        <div
          class="hero-background absolute inset-0 bg-cover bg-center pointer-events-none"
          aria-hidden="true"
        ></div>
        <div
          class="hero-overlay absolute inset-0 pointer-events-none"
          aria-hidden="true"
        ></div>
        <div
          class="hero-content max-w-4xl relative z-10 grid justify-items-center gap-8 mt-12 md:mt-0"
        >
          <div
            class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#378ADD] px-3.5 py-1.5 border border-[#378ADD]/30 bg-[#378ADD]/10 rounded-full w-fit"
          >
            <span class="material-symbols-outlined text-[16px]">terminal</span>
            v2.0 Course Catalog Live
          </div>

          <h1
            class="font-['Hanken_Grotesk'] text-4xl sm:text-6xl md:text-[72px] leading-[1.1] font-bold text-white tracking-tight"
          >
            Code is easy.<br />
            <span class="text-[#E8931A]">Architecture is hard.</span>
          </h1>

          <p
            class="font-['Inter'] text-lg text-[#d9c3af] max-w-2xl leading-relaxed"
          >
            Elevate your engineering from building features to designing
            scalable, resilient systems. Premium training for senior developers
            focused on Full-Stack, AI, and Angular architecture.
          </p>

          <div class="flex flex-wrap justify-center gap-4 mt-2">
            <a
              routerLink="/courses"
              class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#E8931A] px-8 py-4 rounded font-bold hover:scale-[0.98] transition-all flex items-center gap-2 shadow-lg"
            >
              View All Courses
              <span class="material-symbols-outlined text-[18px]"
                >arrow_forward</span
              >
            </a>

            <a
              routerLink="/membership"
              class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#378ADD] border border-[#378ADD] px-8 py-4 rounded hover:bg-[#378ADD]/10 transition-colors flex items-center gap-2"
            >
              <span class="material-symbols-outlined text-[18px]"
                >workspace_premium</span
              >
              Explore Membership
            </a>
          </div>
        </div>
      </section>

      <!-- AI Tools & Coding Languages Marquee Logo Carousel -->
      <section
        class="border-y border-[#1E293B] bg-[#0b0f10]/60 py-8 overflow-hidden relative"
      >
        <div class="px-6 md:px-16 mb-4 flex items-center justify-between">
          <span
            class="font-['JetBrains_Mono'] text-xs uppercase text-[#a18d7b] tracking-widest font-semibold"
            >// ENTERPRISE STACK & AI TOOLING</span
          >
          <span class="font-['JetBrains_Mono'] text-[11px] text-[#378ADD]"
            >HANDS-ON FRAMEWORKS & AGENTS</span
          >
        </div>

        <div class="relative w-full overflow-hidden">
          <div class="animate-marquee flex gap-6 items-center">
            @for (tech of techList; track tech.name) {
              <div
                class="bg-[#121A2B] border border-[#1E293B] hover:border-[#378ADD] rounded-lg px-5 py-3 flex items-center gap-3 shrink-0 transition-all shadow-md"
              >
                <span
                  class="material-symbols-outlined text-[#378ADD] text-xl"
                  >{{ tech.icon }}</span
                >
                <div class="flex flex-col">
                  <span
                    class="font-['JetBrains_Mono'] text-xs font-bold text-white tracking-wide"
                    >{{ tech.name }}</span
                  >
                  <span class="font-['Inter'] text-[10px] text-[#a18d7b]">{{
                    tech.category
                  }}</span>
                </div>
              </div>
            }
            <!-- Duplicate for continuous seamless marquee loop -->
            @for (tech of techList; track tech.name + '-dup') {
              <div
                class="bg-[#121A2B] border border-[#1E293B] hover:border-[#378ADD] rounded-lg px-5 py-3 flex items-center gap-3 shrink-0 transition-all shadow-md"
              >
                <span
                  class="material-symbols-outlined text-[#378ADD] text-xl"
                  >{{ tech.icon }}</span
                >
                <div class="flex flex-col">
                  <span
                    class="font-['JetBrains_Mono'] text-xs font-bold text-white tracking-wide"
                    >{{ tech.name }}</span
                  >
                  <span class="font-['Inter'] text-[10px] text-[#a18d7b]">{{
                    tech.category
                  }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      </section>

      <!-- Featured Courses Highlights Grid -->
      <section class="px-6 md:px-16">
        <div
          class="flex items-center justify-between mb-8 border-b border-[#1E293B] pb-4"
        >
          <div>
            <span
              class="font-['JetBrains_Mono'] text-xs uppercase text-[#E8931A] tracking-widest font-semibold"
              >// CURRICULUM</span
            >
            <h2
              class="font-['Hanken_Grotesk'] text-2xl md:text-3xl font-bold text-white mt-1"
            >
              Featured Architecture Courses
            </h2>
          </div>
          <a
            routerLink="/courses"
            class="hidden sm:flex font-['JetBrains_Mono'] text-xs text-[#378ADD] hover:underline items-center gap-1"
          >
            Browse Catalog
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </a>
        </div>

        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (placeholder of [1, 2, 3]; track placeholder) {
              <div
                class="bg-[#121A2B] border border-[#1E293B] rounded-lg overflow-hidden animate-pulse"
              >
                <div class="aspect-video bg-[#1E293B]"></div>
                <div class="p-5">
                  <div class="h-5 bg-[#1E293B] rounded w-4/5 mb-4"></div>
                  <div class="h-12 bg-[#1E293B] rounded w-full mb-5"></div>
                  <div class="h-4 bg-[#1E293B] rounded w-2/5"></div>
                </div>
              </div>
            }
          </div>
        } @else if (featuredCourses().length) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (course of featuredCourses(); track course.id) {
              <app-course-card [course]="course" />
            }
          </div>
        } @else {
          <div
            class="border border-[#1E293B] rounded-lg p-8 text-center font-['JetBrains_Mono'] text-sm text-[#a18d7b]"
          >
            No courses are live right now. New courses will appear here after
            they are published from the admin panel.
          </div>
        }
      </section>

      <!-- Detailed Membership & Pricing Section -->
      <section
        class="px-6 md:px-16 bg-[#0b0f10]/80 py-16 border-y border-[#1E293B]"
      >
        <div class="max-w-4xl mx-auto text-center mb-14">
          <span
            class="font-['JetBrains_Mono'] text-xs uppercase text-[#E8931A] tracking-widest font-semibold"
            >// MEMBERSHIP PLANS</span
          >
          <h2
            class="font-['Hanken_Grotesk'] text-3xl md:text-5xl font-bold text-white mt-2 mb-4"
          >
            Engineered Plans for Every Stage
          </h2>
          <p class="font-['Inter'] text-base text-[#d9c3af]">
            Unlock full access to production courses, tokenized stream videos,
            weekly architecture teardowns, and certificates.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          <!-- Free Plan Card -->
          <div
            class="bg-[#121A2B] technical-border rounded p-8 flex flex-col justify-between shadow-lg"
          >
            <div>
              <span
                class="font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase tracking-wider font-semibold"
                >Starter Tier</span
              >
              <h3
                class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mt-1 mb-2"
              >
                Free Membership
              </h3>
              <p class="font-['Inter'] text-xs text-[#d9c3af] mb-6">
                Explore the fundamentals and preview our system design
                schematics.
              </p>

              <div class="mb-6 font-['JetBrains_Mono']">
                <span class="text-3xl font-bold text-white">₹0</span>
                <span class="text-xs text-[#a18d7b]"> / forever</span>
              </div>

              <ul
                class="flex flex-col gap-3 font-['Inter'] text-xs text-[#e0e3e5] border-t border-[#1E293B] pt-6 mb-8"
              >
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#378ADD]"
                    >check</span
                  >
                  Access to all free preview lessons
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#378ADD]"
                    >check</span
                  >
                  Architecture schematic blueprints
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#378ADD]"
                    >check</span
                  >
                  Community discussion forum access
                </li>
              </ul>
            </div>

            <a
              routerLink="/auth/signup"
              class="w-full text-center font-['JetBrains_Mono'] text-xs font-bold uppercase text-white border border-[#1E293B] hover:border-[#378ADD] py-3.5 rounded transition-all"
            >
              Create Free Account
            </a>
          </div>

          <!-- Pro Monthly Plan Card (Highlighted) -->
          <div
            class="bg-[#121A2B] border-2 border-[#E8931A] rounded p-8 flex flex-col justify-between shadow-2xl relative"
          >
            <span
              class="absolute -top-3.5 right-6 font-['JetBrains_Mono'] text-[10px] uppercase font-bold text-[#040810] bg-[#E8931A] px-3 py-1 rounded-full shadow"
            >
              RECOMMENDED
            </span>

            <div>
              <span
                class="font-['JetBrains_Mono'] text-xs text-[#E8931A] uppercase tracking-wider font-semibold"
                >Pro Engineer</span
              >
              <h3
                class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mt-1 mb-2"
              >
                Pro Monthly
              </h3>
              <p class="font-['Inter'] text-xs text-[#d9c3af] mb-6">
                Full continuous access to all courses, updates, and Discord
                channel.
              </p>

              <div class="mb-6 font-['JetBrains_Mono']">
                <span class="text-4xl font-bold text-[#E8931A]">₹2,499</span>
                <span class="text-xs text-[#a18d7b]"> / month</span>
              </div>

              <ul
                class="flex flex-col gap-3.5 font-['Inter'] text-xs text-[#e0e3e5] border-t border-[#1E293B] pt-6 mb-8"
              >
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#E8931A]"
                    >check_circle</span
                  >
                  Unlimited access to every architecture course
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#E8931A]"
                    >check_circle</span
                  >
                  Protected Bunny Stream & YouTube Membership playback
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#E8931A]"
                    >check_circle</span
                  >
                  Monthly live system design teardowns
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#E8931A]"
                    >check_circle</span
                  >
                  Private VIP Discord Channel
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#E8931A]"
                    >check_circle</span
                  >
                  Verifiable Certificate of Completion
                </li>
              </ul>
            </div>

            <a
              routerLink="/checkout"
              [queryParams]="{ plan: 'pro-monthly' }"
              class="w-full text-center font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#E8931A] py-3.5 rounded hover:bg-[#E8931A]/90 transition-all shadow-lg"
            >
              Join Pro Monthly
            </a>
          </div>

          <!-- All-Access VIP Annual Plan Card -->
          <div
            class="bg-[#121A2B] technical-border rounded p-8 flex flex-col justify-between shadow-lg"
          >
            <div>
              <span
                class="font-['JetBrains_Mono'] text-xs text-[#378ADD] uppercase tracking-wider font-semibold"
                >VIP Pass</span
              >
              <h3
                class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mt-1 mb-2"
              >
                All-Access VIP
              </h3>
              <p class="font-['Inter'] text-xs text-[#d9c3af] mb-6">
                Save 33% annually + 1-on-1 architecture mentorship session.
              </p>

              <div class="mb-6 font-['JetBrains_Mono']">
                <span class="text-3xl font-bold text-white">₹19,999</span>
                <span class="text-xs text-[#a18d7b]"> / year</span>
              </div>

              <ul
                class="flex flex-col gap-3 font-['Inter'] text-xs text-[#e0e3e5] border-t border-[#1E293B] pt-6 mb-8"
              >
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#378ADD]"
                    >check</span
                  >
                  Everything included in Pro Monthly
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#378ADD]"
                    >check</span
                  >
                  1-on-1 private architecture mentorship session
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#378ADD]"
                    >check</span
                  >
                  Priority code review queue
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#378ADD]"
                    >check</span
                  >
                  Early access to new Agentic AI courses
                </li>
              </ul>
            </div>

            <a
              routerLink="/checkout"
              [queryParams]="{ plan: 'annual-vip' }"
              class="w-full text-center font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#378ADD] border border-[#378ADD] hover:bg-[#378ADD]/10 py-3.5 rounded transition-all"
            >
              Unlock All-Access VIP
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit {
  private coursesService = inject(CoursesService);

  featuredCourses = signal<Course[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.featuredCourses.set(courses.slice(0, 3));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  techList = [
    { name: 'OpenAI GPT-4o', category: 'AI Model', icon: 'smart_toy' },
    { name: 'Claude 3.5 Sonnet', category: 'LLM Engine', icon: 'memory' },
    { name: 'LangChain', category: 'Agent Framework', icon: 'account_tree' },
    { name: 'LlamaIndex', category: 'RAG Pipeline', icon: 'database' },
    { name: 'Angular 19', category: 'Frontend Signals', icon: 'code' },
    { name: 'NestJS', category: 'Backend Framework', icon: 'terminal' },
    { name: 'Python 3.12', category: 'AI Runtime', icon: 'terminal' },
    { name: 'TypeScript', category: 'Type Safety', icon: 'code' },
    { name: 'PostgreSQL', category: 'Relational DB', icon: 'database' },
    { name: 'Tailwind CSS', category: 'Styling Engine', icon: 'palette' },
    { name: 'Nx Monorepo', category: 'Workspace Architecture', icon: 'lan' },
    { name: 'Prisma ORM', category: 'Data Mapping', icon: 'schema' },
    { name: 'Bunny Stream', category: 'Video Tokenization', icon: 'videocam' },
    { name: 'Razorpay', category: 'UPI & Subscriptions', icon: 'payments' },
  ];
}
