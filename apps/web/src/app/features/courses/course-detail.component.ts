import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Title, Meta } from '@angular/platform-browser';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CoursesService, Course } from '../../core/services/courses.service';
import { AuthService } from '../../core/services/auth.service';
import { EnrollmentsService } from '../../core/services/enrollments.service';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    @if (isLoading()) {
      <div class="min-h-[70vh] flex items-center justify-center">
        <span
          class="material-symbols-outlined animate-spin text-3xl text-[#3B82F6]"
          >progress_activity</span
        >
      </div>
    } @else if (course()) {
      <div class="pt-20 pb-20">
        <div
          class="max-w-6xl mx-auto px-6 md:px-16 pt-6 pb-4 font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase tracking-wider"
        >
          <a
            routerLink="/courses"
            class="hover:text-[#3B82F6] transition-colors"
            >Courses</a
          >
          <span class="mx-2 text-[#3B82F6]">/</span>
                  <span>{{ course()?.level }} course</span>
        </div>

        <section
          class="bg-[#121A2B] border-y border-[#1E293B] px-6 md:px-16 py-12"
        >
          <div
            class="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-center"
          >
            <div class="lg:col-span-2">
              <div class="flex items-center gap-3 mb-4">
                <span
                  class="font-['JetBrains_Mono'] text-xs text-[#040810] bg-[#3B82F6] px-3 py-1 rounded font-bold uppercase"
                >
                  {{ course()?.isFree ? 'Free course' : 'Premium course' }}
                </span>
                <span
                  class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] font-bold uppercase"
                >
                  {{ course()?.level }} LEVEL
                </span>
              </div>

              <h1
                class="font-['Hanken_Grotesk'] text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
              >
                {{ course()?.title }}
              </h1>

              <p
                class="font-['Inter'] text-lg text-[#d9c3af] mb-8 leading-relaxed"
              >
                {{ course()?.subtitle }}
              </p>

              <div
                class="flex flex-wrap items-center gap-6 font-['JetBrains_Mono'] text-xs text-[#a18d7b]"
              >
                <div class="flex items-center gap-2">
                  <span
                    class="material-symbols-outlined text-[#3B82F6] text-base"
                    >schedule</span
                  >
                  {{ getTotalDurationMinutes() }} Minutes Total
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="material-symbols-outlined text-[#3B82F6] text-base"
                    >layers</span
                  >
                  {{ getTotalModules() }} Sections ·
                  {{ getTotalLessons() }} Lessons
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="material-symbols-outlined text-[#3B82F6] text-base"
                    >verified</span
                  >
                  Certificate Included
                </div>
                <div class="flex items-center gap-2">
                  <span
                    class="material-symbols-outlined text-[#3B82F6] text-base"
                    >star</span
                  >
                  {{ (course()?.rating || 0) | number: '1.1-1' }}
                  ({{ course()?.reviewCount || 0 }} reviews)
                </div>
              </div>
            </div>

            <!-- Enrollment Card -->
            <div
              class="bg-[#040810] technical-border rounded p-8 flex flex-col gap-6 shadow-2xl"
            >
              <div
                class="relative aspect-video overflow-hidden rounded border border-[#334155] -mx-2 -mt-2 bg-[#0B1120] shadow-xl group"
              >
                @if (!promoPlaying()) {
                  @if (course()?.thumbnail) {
                    <img
                      [src]="course()?.thumbnail"
                      [alt]="course()?.title"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    />
                  } @else {
                    <div class="w-full h-full bg-gradient-to-br from-[#172033] to-[#060A12] flex items-center justify-center">
                      <span class="material-symbols-outlined text-5xl text-[#64748B]">school</span>
                    </div>
                  }
                  @if (course()?.promoVideoUrl) {
                    <button
                      type="button"
                      (click)="playPromo()"
                      class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/25 hover:bg-black/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#3B82F6]"
                      aria-label="Play course preview"
                    >
                      <span class="w-16 h-16 rounded-full bg-white text-[#111827] flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105">
                        <span class="material-symbols-outlined text-4xl ml-1">play_arrow</span>
                      </span>
                      <span class="font-['Inter'] text-sm font-bold text-white drop-shadow">Preview this course</span>
                    </button>
                  }
                } @else if (isUploadedPromoVideo(course()?.promoVideoUrl)) {
                  <video
                    [src]="course()?.promoVideoUrl"
                    controls
                    autoplay
                    playsinline
                    class="w-full h-full object-contain bg-black"
                  ></video>
                } @else if (promoEmbedUrl()) {
                  <iframe
                    [src]="promoEmbedUrl()"
                    class="w-full h-full border-0"
                    title="Course introduction video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                }
              </div>
              <div
                class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] uppercase tracking-widest font-semibold"
              >
                // INSTANT ACCESS
              </div>

              <div class="flex items-baseline justify-between gap-4">
                @if (course()?.isFree) {
                  <span
                    class="font-['JetBrains_Mono'] text-3xl font-bold text-[#3B82F6]"
                    >FREE</span
                  >
                  <span
                    class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] font-semibold text-right"
                    >LOGGED-IN STUDENTS ONLY</span
                  >
                } @else {
                  <span
                    class="font-['JetBrains_Mono'] text-3xl font-bold text-white"
                    >₹{{ course()?.price?.toLocaleString('en-IN') }}</span
                  >
                  <span
                    class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] font-semibold"
                    >ONE-TIME OR MEMBERSHIP</span
                  >
                }
              </div>

              @if (course()?.isFree) {
                @if (isEnrolled()) {
                  <a
                    [routerLink]="['/courses', course()?.slug, 'watch', getFirstLessonId()]"
                    class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#3B82F6] py-4 rounded font-bold hover:bg-[#3B82F6]/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                  >
                    Start learning
                    <span class="material-symbols-outlined text-sm">play_arrow</span>
                  </a>
                } @else {
                  <button
                    type="button"
                    (click)="enrollInFreeCourse()"
                    [disabled]="isEnrolling()"
                    class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#3B82F6] py-4 rounded font-bold hover:bg-[#3B82F6]/90 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60"
                  >
                    {{ isEnrolling() ? 'Enrolling...' : 'Enroll for free' }}
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
                  </button>
                }
                @if (enrollmentMessage()) {
                  <p class="font-['Inter'] text-xs text-[#d9c3af] text-center">
                    {{ enrollmentMessage() }}
                  </p>
                }
              } @else {
                <a
                  [routerLink]="['/checkout']"
                  [queryParams]="{ courseId: course()?.id, slug: course()?.slug }"
                  class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#3B82F6] py-4 rounded font-bold hover:bg-[#3B82F6]/90 transition-all flex items-center justify-center gap-2 shadow-lg"
                >
                  Enroll in Course Now
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              }

              <a
                routerLink="/membership"
                class="w-full text-center font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#3B82F6] border border-[#3B82F6] py-3.5 rounded font-semibold hover:bg-[#3B82F6]/10 transition-colors"
              >
                Get All Courses with Membership
              </a>

              <div
                class="text-center font-['Inter'] text-xs text-[#a18d7b] pt-2 border-t border-[#1E293B]"
              >
                Instant lifetime access • 30-day money-back guarantee
              </div>
            </div>
          </div>
        </section>

        <!-- Curriculum & Overview Section -->
        <section
          class="max-w-6xl mx-auto px-6 md:px-16 mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12"
        >
          <div class="lg:col-span-2">
            <div
              class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6"
            >
              <div>
                <h2
                  class="font-['Hanken_Grotesk'] text-2xl font-bold text-white flex items-center gap-2"
                >
                  <span class="material-symbols-outlined text-[#3B82F6]"
                    >account_tree</span
                  >
                  Course content
                </h2>
                <p class="font-['Inter'] text-sm text-[#a18d7b] mt-2">
                  {{ getTotalModules() }} sections ·
                  {{ getTotalLessons() }} lessons ·
                  {{ getTotalDurationMinutes() }} minutes of curriculum
                </p>
              </div>
              <button
                type="button"
                (click)="toggleAllModules()"
                class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] hover:text-[#3B82F6] transition-colors text-left sm:text-right"
              >
                {{
                  allModulesExpanded()
                    ? 'Collapse all sections'
                    : 'Expand all sections'
                }}
              </button>
            </div>

            <div class="flex flex-col gap-4">
              @for (module of course()?.modules; track module.id) {
                <div
                  class="bg-[#121A2B] technical-border rounded overflow-hidden"
                >
                  <button
                    type="button"
                    (click)="toggleModule(module.id)"
                    class="w-full p-5 bg-[#191c1e]/50 flex items-center justify-between gap-4 border-b border-[#1E293B] text-left hover:bg-[#1d242b] transition-colors"
                  >
                    <span class="flex items-center gap-3 min-w-0">
                      <span
                        class="material-symbols-outlined text-[#3B82F6] text-lg"
                        >{{
                          isModuleExpanded(module.id)
                            ? 'expand_less'
                            : 'expand_more'
                        }}</span
                      >
                      <span
                        class="font-['Hanken_Grotesk'] text-base font-bold text-white truncate"
                        >{{ module.title }}</span
                      >
                    </span>
                    <span
                      class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] whitespace-nowrap"
                    >
                      {{ module.lessons ? module.lessons.length : 0 }} lectures
                      · {{ getModuleDurationMinutes(module) }}m
                    </span>
                  </button>

                  @if (isModuleExpanded(module.id)) {
                    <div class="divide-y divide-[#1E293B]/40">
                      @for (lesson of module.lessons; track lesson.id) {
                        <a
                          [routerLink]="['/courses', course()?.slug, 'watch', lesson.id]"
                          class="p-4 flex items-center justify-between gap-4 hover:bg-[#040810]/40 transition-colors"
                        >
                          <div class="flex items-center gap-3 min-w-0">
                            <span
                              class="material-symbols-outlined text-[#3B82F6] text-sm"
                              >{{ lesson.isFreePreview ? 'play_circle' : 'lock' }}</span
                            >
                            <span
                              class="font-['Inter'] text-sm text-[#e0e3e5] truncate"
                              >{{ lesson.title }}</span
                            >
                          </div>

                          <div class="flex items-center gap-3 shrink-0">
                            @if (lesson.isFreePreview) {
                              <span
                                class="font-['JetBrains_Mono'] text-[10px] text-[#3B82F6] border border-[#3B82F6]/40 px-2 py-0.5 rounded uppercase font-semibold"
                              >
                                WATCH PREVIEW
                              </span>
                            }
                            <span
                              class="font-['JetBrains_Mono'] text-xs text-[#a18d7b]"
                            >
                              {{ Math.round(lesson.duration / 60) }}m
                            </span>
                          </div>
                        </a>
                      }
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Sidebar: Instructor & Details -->
          <div class="flex flex-col gap-8">
            <div class="bg-[#121A2B] technical-border rounded p-6">
              <h3
                class="font-['JetBrains_Mono'] text-xs uppercase text-[#3B82F6] tracking-wider font-bold mb-4"
              >
                // THIS COURSE INCLUDES
              </h3>
              <div class="flex items-center gap-4 mb-4">
                <div
                  class="w-12 h-12 rounded-full bg-[#3B82F6] text-[#040810] font-bold text-xl flex items-center justify-center font-['Hanken_Grotesk']"
                >
                  {{ getInstructorInitials() }}
                </div>
                <div>
                  <h4
                    class="font-['Hanken_Grotesk'] text-base font-bold text-white"
                  >
                    Technyks Architect
                  </h4>
                  <p class="font-['Inter'] text-xs text-[#d9c3af]">
                    Production engineering curriculum
                  </p>
                </div>
              </div>
              <div
                class="flex flex-col gap-3 pt-4 border-t border-[#1E293B] font-['Inter'] text-sm text-[#d9c3af]"
              >
                <div class="flex items-center justify-between gap-3">
                  <span>On-demand lessons</span
                  ><span class="text-white">{{ getTotalLessons() }}</span>
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span>Full curriculum</span
                  ><span class="text-white"
                    >{{ getTotalModules() }} sections</span
                  >
                </div>
                <div class="flex items-center justify-between gap-3">
                  <span>Certificate</span
                  ><span class="text-[#3B82F6]">Included</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Student Reviews -->
        <section class="max-w-6xl mx-auto px-6 md:px-16 mt-16">
          <div class="max-w-3xl">
            <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
              <div>
                <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white flex items-center gap-2">
                  <span class="material-symbols-outlined text-[#3B82F6]">reviews</span>
                  Student reviews
                </h2>
                <p class="font-['Inter'] text-sm text-[#a18d7b] mt-2">
                  {{ (course()?.rating || 0) | number: '1.1-1' }} average rating · {{ course()?.reviewCount || 0 }} reviews
                </p>
              </div>
            </div>

            @if (course()?.reviews?.length) {
              <div class="flex flex-col gap-3">
                @for (review of course()?.reviews; track review.id) {
                  <article class="bg-[#121A2B] technical-border rounded p-5">
                    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div class="flex items-center gap-3">
                        <div class="w-9 h-9 rounded-full bg-[#3B82F6] text-[#040810] font-bold flex items-center justify-center">
                          {{ review.user.name.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <div class="font-['Hanken_Grotesk'] text-sm font-bold text-white">{{ review.user.name }}</div>
                          <div class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b]">{{ review.createdAt | date: 'mediumDate' }}</div>
                        </div>
                      </div>
                      <div class="font-['JetBrains_Mono'] text-sm text-[#3B82F6]" [attr.aria-label]="review.rating + ' out of 5 stars'">
                        {{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}
                      </div>
                    </div>
                    <p class="font-['Inter'] text-sm text-[#d9c3af] leading-relaxed">{{ review.comment }}</p>
                  </article>
                }
              </div>
            } @else {
              <div class="bg-[#121A2B] border border-dashed border-[#3B82F6]/50 rounded p-6 font-['Inter'] text-sm text-[#a18d7b]">
                No reviews yet. Be the first enrolled student to share your experience.
              </div>
            }

            <div class="bg-[#121A2B] technical-border rounded p-6 mt-6">
              @if (authService.isAuthenticated() && isEnrolled()) {
                <h3 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mb-4">Share your review</h3>
                <div class="flex items-center gap-2 mb-4" role="radiogroup" aria-label="Course rating">
                  @for (star of [1, 2, 3, 4, 5]; track star) {
                    <button
                      type="button"
                      (click)="reviewRating = star"
                      [attr.aria-label]="star + ' stars'"
                      [class.text-[#3B82F6]]="star <= reviewRating"
                      [class.text-[#a18d7b]]="star > reviewRating"
                      class="text-2xl leading-none hover:text-[#3B82F6] transition-colors"
                    >★</button>
                  }
                  <span class="font-['JetBrains_Mono'] text-xs text-[#a18d7b] ml-2">{{ reviewRating }}/5</span>
                </div>
                <textarea
                  [(ngModel)]="reviewComment"
                  rows="4"
                  maxlength="2000"
                  placeholder="What did you think about this course?"
                  class="w-full bg-[#040810] border border-[#1E293B] focus:border-[#3B82F6] focus:outline-none rounded px-4 py-3 text-sm text-white font-['Inter'] mb-4"
                ></textarea>
                <div class="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    (click)="submitReview()"
                    [disabled]="isSubmittingReview() || reviewRating === 0 || reviewComment.trim().length < 10"
                    class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#3B82F6] px-5 py-3 rounded hover:bg-[#2563eb] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {{ isSubmittingReview() ? 'Saving...' : 'Publish review' }}
                  </button>
                  @if (reviewMessage()) {
                    <span class="font-['Inter'] text-xs text-[#3B82F6]">{{ reviewMessage() }}</span>
                  }
                </div>
              } @else if (!authService.isAuthenticated()) {
                <p class="font-['Inter'] text-sm text-[#d9c3af]">
                  <a routerLink="/auth/login" [queryParams]="{ returnUrl: router.url }" class="text-[#3B82F6] hover:underline">Sign in</a>
                  and enroll to leave a course review.
                </p>
              } @else {
                <p class="font-['Inter'] text-sm text-[#d9c3af]">Enroll in this course to leave a review.</p>
              }
            </div>
          </div>
        </section>
      </div>
    }
  `,
})
export class CourseDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  router = inject(Router);
  private coursesService = inject(CoursesService);
  private titleService = inject(Title);
  private metaService = inject(Meta);
  private sanitizer = inject(DomSanitizer);
  authService = inject(AuthService);
  private enrollmentsService = inject(EnrollmentsService);

  course = signal<Course | null>(null);
  isLoading = signal(true);
  expandedModules = signal<Set<string>>(new Set());
  promoEmbedUrl = signal<SafeResourceUrl | null>(null);
  promoPlaying = signal(false);
  isEnrolled = signal(false);
  isEnrolling = signal(false);
  enrollmentMessage = signal('');
  reviewRating = 0;
  reviewComment = '';
  isSubmittingReview = signal(false);
  reviewMessage = signal('');
  Math = Math;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.coursesService.getCourseBySlug(slug).subscribe({
          next: (data) => {
            this.course.set(data);
            this.loadEnrollmentStatus(data.id);
            this.promoPlaying.set(false);
            this.promoEmbedUrl.set(this.toPromoEmbedUrl(data.promoVideoUrl));
            this.expandedModules.set(
              new Set(
                data.modules?.slice(0, 1).map((module) => module.id) || [],
              ),
            );
            this.isLoading.set(false);
            this.titleService.setTitle(`${data.title} - Technyks Academy`);
            this.metaService.updateTag({
              name: 'description',
              content: data.subtitle,
            });
          },
          error: () => this.isLoading.set(false),
        });
      }
    });
  }

  private loadEnrollmentStatus(courseId: string) {
    if (!this.authService.isAuthenticated()) return;
    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (enrollments) =>
        this.isEnrolled.set(
          enrollments.some((enrollment) => enrollment.courseId === courseId),
        ),
      error: () => this.isEnrolled.set(false),
    });
  }

  getFirstLessonId(): string {
    return this.course()?.modules?.find((module) => module.lessons?.length)?.lessons[0]?.id || '';
  }

  enrollInFreeCourse() {
    const course = this.course();
    if (!course?.isFree) return;
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/auth/login'], {
        queryParams: { returnUrl: this.router.url },
      });
      return;
    }

    this.isEnrolling.set(true);
    this.enrollmentMessage.set('');
    this.enrollmentsService.enrollInFreeCourse(course.id).subscribe({
      next: () => {
        this.isEnrolled.set(true);
        this.isEnrolling.set(false);
        this.enrollmentMessage.set('You are enrolled. Your lessons are ready.');
      },
      error: (error) => {
        this.isEnrolling.set(false);
        this.enrollmentMessage.set(
          error?.error?.message || 'Free enrollment could not be completed.',
        );
      },
    });
  }

  submitReview() {
    const course = this.course();
    const comment = this.reviewComment.trim();
    if (!course || !this.isEnrolled() || this.reviewRating < 1 || comment.length < 10) return;

    this.isSubmittingReview.set(true);
    this.reviewMessage.set('');
    this.coursesService
      .submitReview(course.id, { rating: this.reviewRating, comment })
      .subscribe({
        next: (review) => {
          const reviews = [
            review,
            ...(course.reviews || []).filter((candidate) => candidate.id !== review.id),
          ];
          const rating = Number(
            (reviews.reduce((total, item) => total + item.rating, 0) / reviews.length).toFixed(1),
          );
          this.course.set({ ...course, reviews, rating, reviewCount: reviews.length });
          this.reviewRating = 0;
          this.reviewComment = '';
          this.isSubmittingReview.set(false);
          this.reviewMessage.set('Your review has been published.');
        },
        error: (error) => {
          this.isSubmittingReview.set(false);
          this.reviewMessage.set(error?.error?.message || 'Review could not be saved.');
        },
      });
  }

  getTotalDurationMinutes(): number {
    const c = this.course();
    if (!c || !c.modules) return 0;
    let total = 0;
    c.modules.forEach((m) =>
      m.lessons?.forEach((l) => (total += l.duration || 0)),
    );
    return Math.round(total / 60);
  }

  getTotalLessons(): number {
    const c = this.course();
    if (!c || !c.modules) return 0;
    let count = 0;
    c.modules.forEach((m) => (count += m.lessons?.length || 0));
    return count;
  }

  getTotalModules(): number {
    return this.course()?.modules?.length || 0;
  }

  getModuleDurationMinutes(module: Course['modules'][number]): number {
    return Math.round(
      (module.lessons || []).reduce(
        (total, lesson) => total + (lesson.duration || 0),
        0,
      ) / 60,
    );
  }

  isModuleExpanded(moduleId: string): boolean {
    return this.expandedModules().has(moduleId);
  }

  toggleModule(moduleId: string) {
    const expanded = new Set(this.expandedModules());
    if (expanded.has(moduleId)) expanded.delete(moduleId);
    else expanded.add(moduleId);
    this.expandedModules.set(expanded);
  }

  allModulesExpanded(): boolean {
    const modules = this.course()?.modules || [];
    return (
      modules.length > 0 &&
      modules.every((module) => this.expandedModules().has(module.id))
    );
  }

  toggleAllModules() {
    const modules = this.course()?.modules || [];
    this.expandedModules.set(
      this.allModulesExpanded()
        ? new Set()
        : new Set(modules.map((module) => module.id)),
    );
  }

  getInstructorInitials(): string {
    return 'TA';
  }

  isUploadedPromoVideo(url?: string | null): boolean {
    return Boolean(
      url &&
        (url.startsWith('data:video/') ||
          /\.(mp4|webm|ogg|mov)(?:\?|$)/i.test(url)),
    );
  }

  playPromo() {
    const value = this.course()?.promoVideoUrl;
    if (!value) return;
    this.promoEmbedUrl.set(this.toPromoEmbedUrl(value, true));
    this.promoPlaying.set(true);
  }

  private toPromoEmbedUrl(value?: string | null, autoplay = false): SafeResourceUrl | null {
    if (!value || this.isUploadedPromoVideo(value)) return null;
    try {
      const url = new URL(value);
      if (url.hostname === 'youtu.be') {
        const videoId = url.pathname.split('/').filter(Boolean)[0];
        return videoId
          ? this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube-nocookie.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`,
            )
          : null;
      }
      if (
        url.hostname === 'youtube.com' ||
        url.hostname.endsWith('.youtube.com')
      ) {
        const videoId =
          url.searchParams.get('v') ||
          url.pathname.match(/^\/(?:embed|shorts)\/([A-Za-z0-9_-]{11})/)?.[1];
        return videoId
          ? this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://www.youtube-nocookie.com/embed/${videoId}${autoplay ? '?autoplay=1' : ''}`,
            )
          : null;
      }
      if (url.hostname === 'vimeo.com' || url.hostname.endsWith('.vimeo.com')) {
        const videoId = url.pathname
          .split('/')
          .filter(Boolean)
          .find((part) => /^\d+$/.test(part));
        return videoId
          ? this.sanitizer.bypassSecurityTrustResourceUrl(
              `https://player.vimeo.com/video/${videoId}${autoplay ? '?autoplay=1' : ''}`,
            )
          : null;
      }
    } catch {
      return null;
    }
    return null;
  }
}
