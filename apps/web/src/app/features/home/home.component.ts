import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, signal } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Course, CoursesService } from '../../core/services/courses.service';
import { CourseCardComponent } from '../../core/components/course-card/course-card.component';
import { SkeletonLoaderComponent } from '../../core/components/skeleton/skeleton-loader.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, CourseCardComponent, SkeletonLoaderComponent],
  template: `
    <div class="flex flex-col gap-24 pb-20 pt-16">
      <!-- Hero Section (Matches Reference Screenshots in Light & Dark Mode) -->
      <section
        class="hero-section min-h-[85vh] flex flex-col justify-between items-center px-4 sm:px-8 md:px-16 pt-12 pb-8 relative overflow-hidden text-center"
      >
        <div
          class="hero-background absolute inset-0 pointer-events-none"
          aria-hidden="true"
        ></div>
        <div
          class="hero-overlay absolute inset-0 pointer-events-none"
          aria-hidden="true"
        ></div>

        <!-- Main Center Hero Content -->
        <div
          class="hero-content max-w-4xl w-full relative z-10 flex flex-col items-center gap-6 my-auto"
        >
          <!-- Welcome Badge -->
          <div
            class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-blue-200/90 bg-white/90 shadow-sm text-xs font-['JetBrains_Mono'] tracking-wider uppercase transition-all dark:border-[#A855F7]/80 dark:bg-[#070b16]/90 dark:shadow-[0_0_18px_rgba(168,85,247,0.35)]"
          >
            <span class="material-symbols-outlined text-[#2563EB] dark:text-[#C084FC] text-[16px]">auto_awesome</span>
            <span class="text-slate-700 dark:text-slate-200 font-semibold">WELCOME TO</span>
            <span class="text-[#2563EB] dark:text-[#C084FC] font-bold">TECHNYKS ACADEMY</span>
          </div>

          <!-- Main Headline -->
          <h1
            class="font-['Hanken_Grotesk'] text-5xl sm:text-7xl md:text-[86px] leading-[1.05] font-extrabold tracking-tight text-slate-900 dark:!text-white"
          >
            Learn <span class="text-[#2563EB] dark:!text-[#3B82F6] dark:drop-shadow-[0_0_30px_rgba(59,130,246,0.6)]">AI.</span><br />
            Think. Build.<br />
            <span class="bg-gradient-to-r from-[#A855F7] via-[#8B5CF6] to-[#3B82F6] dark:from-[#C084FC] dark:via-[#A855F7] dark:to-[#60A5FA] bg-clip-text text-transparent dark:drop-shadow-[0_0_25px_rgba(168,85,247,0.5)]">Innovate.</span>
          </h1>

          <!-- Subheading -->
          <p
            class="font-['Inter'] text-base sm:text-lg md:text-xl text-slate-600 dark:!text-slate-200 max-w-2xl leading-relaxed font-normal"
          >
            Learn AI, think for yourself, and turn powerful AI tools into new
            ideas, useful products, and real-world innovations.
          </p>

          <!-- Action Buttons -->
          <div class="flex flex-wrap justify-center gap-4 mt-2">
            <a
              routerLink="/courses"
              class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-bold !text-white px-7 py-4 rounded-xl transition-all shadow-md flex items-center gap-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] hover:scale-[0.98] dark:bg-gradient-to-r dark:from-[#2563EB] dark:to-[#9333EA] dark:hover:from-[#1D4ED8] dark:hover:to-[#7E22CE] dark:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
            >
              <span class="material-symbols-outlined text-[19px] !text-white">school</span>
              <span class="!text-white">VIEW ALL COURSES</span>
              <span class="material-symbols-outlined text-[19px] !text-white">arrow_forward</span>
            </a>

            <a
              routerLink="/membership"
              class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider font-bold px-7 py-4 rounded-xl transition-all shadow-sm flex items-center gap-2.5 border-2 border-[#2563EB] text-[#2563EB] bg-white hover:bg-blue-50/50 hover:scale-[0.98] dark:border-[#6366F1] dark:!text-white dark:bg-[#0B0F19]/80 dark:hover:bg-[#1E293B] dark:shadow-[0_0_15px_rgba(99,102,241,0.25)]"
            >
              <span class="material-symbols-outlined text-[19px]">workspace_premium</span>
              <span>EXPLORE MEMBERSHIP</span>
              <span class="material-symbols-outlined text-[19px]">arrow_forward</span>
            </a>
          </div>
        </div>

        <!-- Floating Bottom Feature Dock (4 Cards) -->
        <div class="w-full max-w-5xl mt-12 relative z-10">
          <div
            class="rounded-2xl p-4 md:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 backdrop-blur-xl transition-all bg-white/95 border border-slate-200/70 shadow-[0_15px_35px_rgba(0,0,0,0.06)] text-slate-800 dark:bg-[#070C18]/90 dark:border-white/15 dark:shadow-[0_20px_40px_rgba(0,0,0,0.8)] dark:!text-white"
          >
            <!-- Feature 1: Beginner Friendly -->
            <div class="flex items-center gap-3.5 p-2">
              <div
                class="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-purple-100 text-purple-600 dark:bg-purple-900/60 dark:text-purple-300 dark:border dark:border-purple-500/40 shadow-sm"
              >
                <span class="material-symbols-outlined text-2xl">menu_book</span>
              </div>
              <div class="flex flex-col text-left">
                <span class="font-['Hanken_Grotesk'] text-sm font-bold text-slate-900 dark:!text-white">Beginner Friendly</span>
                <span class="font-['Inter'] text-xs text-slate-500 dark:!text-slate-300">Start from the basics</span>
              </div>
            </div>

            <!-- Feature 2: Hands-on Learning -->
            <div class="flex items-center gap-3.5 p-2">
              <div
                class="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-300 dark:border dark:border-blue-500/40 shadow-sm"
              >
                <span class="material-symbols-outlined text-2xl">smart_toy</span>
              </div>
              <div class="flex flex-col text-left">
                <span class="font-['Hanken_Grotesk'] text-sm font-bold text-slate-900 dark:!text-white">Hands-on Learning</span>
                <span class="font-['Inter'] text-xs text-slate-500 dark:!text-slate-300">Real projects, real skills</span>
              </div>
            </div>

            <!-- Feature 3: Build & Innovate -->
            <div class="flex items-center gap-3.5 p-2">
              <div
                class="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-100 text-emerald-600 dark:bg-emerald-900/60 dark:text-emerald-300 dark:border dark:border-emerald-500/40 shadow-sm"
              >
                <span class="material-symbols-outlined text-2xl">rocket_launch</span>
              </div>
              <div class="flex flex-col text-left">
                <span class="font-['Hanken_Grotesk'] text-sm font-bold text-slate-900 dark:!text-white">Build & Innovate</span>
                <span class="font-['Inter'] text-xs text-slate-500 dark:!text-slate-300">Create your own AI tools</span>
              </div>
            </div>

            <!-- Feature 4: Community Support -->
            <div class="flex items-center gap-3.5 p-2">
              <div
                class="h-12 w-12 rounded-xl flex items-center justify-center shrink-0 bg-amber-100 text-amber-600 dark:bg-amber-900/60 dark:text-amber-300 dark:border dark:border-amber-500/40 shadow-sm"
              >
                <span class="material-symbols-outlined text-2xl">star</span>
              </div>
              <div class="flex flex-col text-left">
                <span class="font-['Hanken_Grotesk'] text-sm font-bold text-slate-900 dark:!text-white">Community Support</span>
                <span class="font-['Inter'] text-xs text-slate-500 dark:!text-slate-300">Learn together, grow together</span>
              </div>
            </div>
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
          <span class="font-['JetBrains_Mono'] text-[11px] text-[#3B82F6]"
            >HANDS-ON FRAMEWORKS & AGENTS</span
          >
        </div>

        <div class="relative w-full overflow-hidden">
          <div class="animate-marquee flex gap-6 items-center">
            @for (tech of techList; track tech.name) {
              <div
                class="bg-[#121A2B] border border-[#1E293B] hover:border-[#3B82F6] rounded-lg px-5 py-3 flex items-center gap-3 shrink-0 transition-all shadow-md"
              >
                <span
                  class="material-symbols-outlined text-[#3B82F6] text-xl"
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
                class="bg-[#121A2B] border border-[#1E293B] hover:border-[#3B82F6] rounded-lg px-5 py-3 flex items-center gap-3 shrink-0 transition-all shadow-md"
              >
                <span
                  class="material-symbols-outlined text-[#3B82F6] text-xl"
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
              class="font-['JetBrains_Mono'] text-xs uppercase text-[#3B82F6] tracking-widest font-semibold"
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
            class="hidden sm:flex font-['JetBrains_Mono'] text-xs text-[#3B82F6] hover:underline items-center gap-1"
          >
            Browse Catalog
            <span class="material-symbols-outlined text-sm">chevron_right</span>
          </a>
        </div>

        @if (isLoading()) {
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            @for (placeholder of [1, 2, 3]; track placeholder) {
              <app-skeleton-loader type="card" />
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
            class="font-['JetBrains_Mono'] text-xs uppercase text-[#3B82F6] tracking-widest font-semibold"
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
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check</span
                  >
                  Access to all free preview lessons
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check</span
                  >
                  Architecture schematic blueprints
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check</span
                  >
                  Community discussion forum access
                </li>
              </ul>
            </div>

            <a
              routerLink="/auth/signup"
              class="w-full text-center font-['JetBrains_Mono'] text-xs font-bold uppercase text-white border border-[#1E293B] hover:border-[#3B82F6] py-3.5 rounded transition-all"
            >
              Create Free Account
            </a>
          </div>

          <!-- Pro Monthly Plan Card (Highlighted) -->
          <div
            class="bg-[#121A2B] border-2 border-[#3B82F6] rounded p-8 flex flex-col justify-between shadow-2xl relative"
          >
            <span
              class="absolute -top-3.5 right-6 font-['JetBrains_Mono'] text-[10px] uppercase font-bold text-[#040810] bg-[#3B82F6] px-3 py-1 rounded-full shadow"
            >
              RECOMMENDED
            </span>

            <div>
              <span
                class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] uppercase tracking-wider font-semibold"
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
                <span class="text-4xl font-bold text-[#3B82F6]">₹2,499</span>
                <span class="text-xs text-[#a18d7b]"> / month</span>
              </div>

              <ul
                class="flex flex-col gap-3.5 font-['Inter'] text-xs text-[#e0e3e5] border-t border-[#1E293B] pt-6 mb-8"
              >
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check_circle</span
                  >
                  Unlimited access to every architecture course
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check_circle</span
                  >
                  Protected Bunny Stream & YouTube Membership playback
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check_circle</span
                  >
                  Monthly live system design teardowns
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check_circle</span
                  >
                  Private VIP Discord Channel
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check_circle</span
                  >
                  Verifiable Certificate of Completion
                </li>
              </ul>
            </div>

            <a
              routerLink="/checkout"
              [queryParams]="{ plan: 'pro-monthly' }"
              class="w-full text-center font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#3B82F6] py-3.5 rounded hover:bg-[#3B82F6]/90 transition-all shadow-lg"
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
                class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] uppercase tracking-wider font-semibold"
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
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check</span
                  >
                  Everything included in Pro Monthly
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check</span
                  >
                  1-on-1 private architecture mentorship session
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check</span
                  >
                  Priority code review queue
                </li>
                <li class="flex items-center gap-2.5">
                  <span class="material-symbols-outlined text-sm text-[#3B82F6]"
                    >check</span
                  >
                  Early access to new Agentic AI courses
                </li>
              </ul>
            </div>

            <a
              routerLink="/checkout"
              [queryParams]="{ plan: 'annual-vip' }"
              class="w-full text-center font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#3B82F6] border border-[#3B82F6] hover:bg-[#3B82F6]/10 py-3.5 rounded transition-all"
            >
              Unlock All-Access VIP
            </a>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class HomeComponent implements OnInit, OnDestroy {
  private coursesService = inject(CoursesService);
  private platformId = inject(PLATFORM_ID);

  featuredCourses = signal<Course[]>([]);
  isLoading = signal(true);
  typedTopic = signal('NN');
  private readonly typingTopics = ['NN', 'Full Stack', 'Data Science', 'Data Engineering'];
  private typingTopicIndex = 0;
  private typingCharacterIndex = this.typingTopics[0].length;
  private isDeletingTyping = true;
  private typingTimer?: ReturnType<typeof setTimeout>;

  ngOnInit() {
    this.coursesService.getCourses().subscribe({
      next: (courses) => {
        this.featuredCourses.set(courses.slice(0, 3));
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
    if (isPlatformBrowser(this.platformId)) {
      this.runTypingAnimation();
    }
  }

  ngOnDestroy() {
    if (this.typingTimer) clearTimeout(this.typingTimer);
  }

  private runTypingAnimation() {
    const topic = this.typingTopics[this.typingTopicIndex];
    if (this.isDeletingTyping) {
      this.typingCharacterIndex = Math.max(0, this.typingCharacterIndex - 1);
    } else {
      this.typingCharacterIndex = Math.min(topic.length, this.typingCharacterIndex + 1);
    }
    this.typedTopic.set(topic.slice(0, this.typingCharacterIndex));

    let delay = this.isDeletingTyping ? 55 : 90;
    if (this.isDeletingTyping && this.typingCharacterIndex === 0) {
      this.isDeletingTyping = false;
      this.typingTopicIndex = (this.typingTopicIndex + 1) % this.typingTopics.length;
      this.typingCharacterIndex = 0;
      delay = 280;
    } else if (!this.isDeletingTyping && this.typingCharacterIndex === topic.length) {
      this.isDeletingTyping = true;
      delay = 1500;
    }
    this.typingTimer = setTimeout(() => this.runTypingAnimation(), delay);
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
