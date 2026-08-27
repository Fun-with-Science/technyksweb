import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { CoursesService, Course } from '../../core/services/courses.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isLoading()) {
      <div class="min-h-[70vh] flex items-center justify-center">
        <span class="material-symbols-outlined animate-spin text-3xl text-[#E8931A]">progress_activity</span>
      </div>
    } @else if (course()) {
      <div class="pt-20 pb-20">
        <!-- Hero Header -->
        <section class="bg-[#121A2B] border-b border-[#1E293B] px-6 md:px-16 py-16">
          <div class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            <div class="lg:col-span-2">
              <div class="flex items-center gap-3 mb-4">
                <span class="font-['JetBrains_Mono'] text-xs text-[#378ADD] bg-[#378ADD]/10 px-3 py-1 border border-[#378ADD]/30 rounded">
                  v2.1.0 ARCHITECTURE TRACK
                </span>
                <span class="font-['JetBrains_Mono'] text-xs text-[#E8931A] font-bold uppercase">
                  {{ course()?.level }} LEVEL
                </span>
              </div>

              <h1 class="font-['Hanken_Grotesk'] text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                {{ course()?.title }}
              </h1>

              <p class="font-['Inter'] text-lg text-[#d9c3af] mb-8 leading-relaxed">
                {{ course()?.subtitle }}
              </p>

              <div class="flex flex-wrap items-center gap-6 font-['JetBrains_Mono'] text-xs text-[#a18d7b]">
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#378ADD] text-base">schedule</span>
                  {{ getTotalDurationMinutes() }} Minutes Total
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#378ADD] text-base">layers</span>
                  {{ getTotalLessons() }} Lessons
                </div>
                <div class="flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#378ADD] text-base">verified</span>
                  Certificate Included
                </div>
              </div>
            </div>

            <!-- Enrollment Card -->
            <div class="bg-[#040810] technical-border rounded p-8 flex flex-col gap-6 shadow-2xl">
              <div class="font-['JetBrains_Mono'] text-xs text-[#378ADD] uppercase tracking-widest font-semibold">// INSTANT ACCESS</div>
              
              <div class="flex items-baseline justify-between">
                <span class="font-['JetBrains_Mono'] text-3xl font-bold text-white">₹{{ course()?.price?.toLocaleString('en-IN') }}</span>
                <span class="font-['JetBrains_Mono'] text-xs text-[#E8931A] font-semibold">ONE-TIME OR MEMBERSHIP</span>
              </div>

              <a
                [routerLink]="['/checkout']"
                [queryParams]="{ courseId: course()?.id, slug: course()?.slug }"
                class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#E8931A] py-4 rounded font-bold hover:bg-[#E8931A]/90 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                Enroll in Track Now
                <span class="material-symbols-outlined text-sm">arrow_forward</span>
              </a>

              <a
                routerLink="/membership"
                class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#378ADD] border border-[#378ADD] py-3.5 rounded font-semibold hover:bg-[#378ADD]/10 transition-colors"
              >
                Get All Tracks with Membership
              </a>

              <div class="text-center font-['Inter'] text-xs text-[#a18d7b] pt-2 border-t border-[#1E293B]">
                Instant lifetime access • 30-day money-back guarantee
              </div>
            </div>
          </div>
        </section>

        <!-- Curriculum & Overview Section -->
        <section class="max-w-6xl mx-auto px-6 md:px-16 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          <!-- Modules & Lessons Accordion -->
          <div class="lg:col-span-2">
            <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span class="material-symbols-outlined text-[#E8931A]">account_tree</span>
              Curriculum Breakdown
            </h2>

            <div class="flex flex-col gap-4">
              @for (module of course()?.modules; track module.id) {
                <div class="bg-[#121A2B] technical-border rounded overflow-hidden">
                  <div class="p-5 bg-[#191c1e]/50 flex items-center justify-between border-b border-[#1E293B]">
                    <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white">
                      {{ module.title }}
                    </h3>
                    <span class="font-['JetBrains_Mono'] text-xs text-[#378ADD]">
                      {{ module.lessons ? module.lessons.length : 0 }} Lessons
                    </span>
                  </div>

                  <div class="divide-y divide-[#1E293B]/40">
                    @for (lesson of module.lessons; track lesson.id) {
                      <div class="p-4 flex items-center justify-between hover:bg-[#040810]/40 transition-colors">
                        <div class="flex items-center gap-3">
                          <span class="material-symbols-outlined text-[#378ADD] text-sm">play_circle</span>
                          <span class="font-['Inter'] text-sm text-[#e0e3e5]">{{ lesson.title }}</span>
                        </div>

                        <div class="flex items-center gap-3">
                          @if (lesson.isFreePreview) {
                            <span class="font-['JetBrains_Mono'] text-[10px] text-[#E8931A] border border-[#E8931A]/40 px-2 py-0.5 rounded uppercase font-semibold">
                              FREE PREVIEW
                            </span>
                          }
                          <span class="font-['JetBrains_Mono'] text-xs text-[#a18d7b]">
                            {{ Math.round(lesson.duration / 60) }}m
                          </span>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Sidebar: Instructor & Details -->
          <div class="flex flex-col gap-8">
            <div class="bg-[#121A2B] technical-border rounded p-6">
              <h3 class="font-['JetBrains_Mono'] text-xs uppercase text-[#E8931A] tracking-wider font-bold mb-4">// INSTRUCTOR</h3>
              <div class="flex items-center gap-4 mb-4">
                <div class="w-12 h-12 rounded-full bg-[#E8931A] text-[#040810] font-bold text-xl flex items-center justify-center font-['Hanken_Grotesk']">
                  TA
                </div>
                <div>
                  <h4 class="font-['Hanken_Grotesk'] text-base font-bold text-white">Technyks Architect</h4>
                  <p class="font-['Inter'] text-xs text-[#d9c3af]">Principal Systems Engineer</p>
                </div>
              </div>
              <p class="font-['Inter'] text-xs text-[#d9c3af] leading-relaxed">
                Over 10+ years architecting high-scale distributed systems, Nx monorepos, and agentic AI platforms for global enterprise users.
              </p>
            </div>
          </div>
        </section>
      </div>
    }
  `
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coursesService = inject(CoursesService);
  private titleService = inject(Title);
  private metaService = inject(Meta);

  course = signal<Course | null>(null);
  isLoading = signal(true);
  Math = Math;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.coursesService.getCourseBySlug(slug).subscribe({
          next: (data) => {
            this.course.set(data);
            this.isLoading.set(false);
            this.titleService.setTitle(`${data.title} - Technyks Academy`);
            this.metaService.updateTag({ name: 'description', content: data.subtitle });
          },
          error: () => this.isLoading.set(false)
        });
      }
    });
  }

  getTotalDurationMinutes(): number {
    const c = this.course();
    if (!c || !c.modules) return 0;
    let total = 0;
    c.modules.forEach(m => m.lessons?.forEach(l => total += l.duration || 0));
    return Math.round(total / 60);
  }

  getTotalLessons(): number {
    const c = this.course();
    if (!c || !c.modules) return 0;
    let count = 0;
    c.modules.forEach(m => count += m.lessons?.length || 0);
    return count;
  }
}
