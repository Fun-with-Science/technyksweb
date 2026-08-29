import {
  Component,
  signal,
  inject,
  OnInit,
  OnDestroy,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import {
  EnrollmentsService,
  PlaybackTokenResponse,
} from '../../core/services/enrollments.service';
import { CoursesService, Course } from '../../core/services/courses.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-watch',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="watch-shell pt-16 min-h-screen flex flex-col md:flex-row overflow-x-hidden">
      <!-- Main Video Player Container -->
      <main class="watch-main min-w-0 flex-1 p-3 sm:p-4 md:p-5 lg:p-7 flex flex-col gap-4">
        @if (isLoading()) {
          <div class="watch-card w-full aspect-video rounded flex flex-col items-center justify-center">
            <span class="material-symbols-outlined animate-spin text-4xl text-[#E8931A] mb-2">progress_activity</span>
            <span class="font-['JetBrains_Mono'] text-xs text-[#378ADD]">Verifying protected lesson playback...</span>
          </div>
        } @else if (playbackData()?.videoAvailable && safeEmbedUrl()) {
          <div class="watch-player w-full aspect-video rounded overflow-hidden shadow-2xl relative">
            <iframe
              [src]="safeEmbedUrl()"
              class="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          <div class="watch-card flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 rounded">
            <div>
              <div class="watch-accent inline-flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] mb-1">
                <span class="material-symbols-outlined text-sm">lock</span>
                {{ playbackData()?.provider === 'YOUTUBE' ? 'YOUTUBE MEMBERSHIP VIDEO' : 'TOKEN AUTHENTICATED BUNNY STREAM (EXPIRES IN 4H)' }}
              </div>
              <h1 class="watch-heading font-['Hanken_Grotesk'] text-lg sm:text-xl font-bold">
                {{ playbackData()?.title }}
              </h1>
            </div>

            <button
              (click)="markAsCompleted()"
              [class.bg-[#378ADD]]="isCurrentLessonCompleted()"
              [class.bg-[#E8931A]]="!isCurrentLessonCompleted()"
              [disabled]="isCurrentLessonCompleted()"
              [attr.aria-label]="isCurrentLessonCompleted() ? 'Lesson completed' : 'Mark lesson as completed'"
              class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] px-5 py-3 rounded hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <span class="material-symbols-outlined text-sm">
                {{ isCurrentLessonCompleted() ? 'check_circle' : 'task_alt' }}
              </span>
              {{ isCurrentLessonCompleted() ? 'Lesson Completed' : 'Mark as Completed' }}
            </button>
          </div>
          @if (progressError()) {
            <p class="watch-progress-error font-['Inter'] text-xs" role="alert">{{ progressError() }}</p>
          }
        } @else if (playbackData()) {
          <div class="watch-card w-full aspect-video rounded flex flex-col items-center justify-center p-5 sm:p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-[#E8931A] mb-2">video_settings</span>
            <h3 class="watch-heading font-['Hanken_Grotesk'] text-lg font-bold mb-2">Video not connected yet</h3>
            <p class="watch-muted font-['Inter'] text-sm max-w-md">
              This lesson does not have a playable video source yet. Add a Bunny Stream video ID or a YouTube Membership video reference in the curriculum.
            </p>
          </div>
        } @else {
          <div class="watch-card w-full aspect-video rounded flex flex-col items-center justify-center p-5 sm:p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-[#ffb4ab] mb-2">lock_person</span>
            <h3 class="watch-heading font-['Hanken_Grotesk'] text-lg font-bold mb-2">
              {{ playbackError() ? 'This lesson is locked' : 'Streaming Unauthorized' }}
            </h3>
            <p class="watch-muted font-['Inter'] text-sm max-w-md mb-6">
              {{ playbackError() || 'This is paid token-gated content. Please enroll in this course or join Membership to stream this lesson.' }}
            </p>
            <a routerLink="/courses" class="font-['JetBrains_Mono'] text-xs uppercase text-[#040810] bg-[#E8931A] px-6 py-3 rounded font-bold">
              Enroll in Course
            </a>
          </div>
        }
      </main>

      <!-- Right Drawer Curriculum Navigation Sidebar -->
      <aside class="watch-sidebar w-full md:w-[40%] md:min-w-[320px] md:max-w-[520px] p-4 sm:p-5 md:p-6 flex flex-col gap-5 md:sticky md:top-16 md:h-[calc(100vh-4rem)]">
        <div class="shrink-0">
          <span class="watch-accent font-['JetBrains_Mono'] text-xs uppercase font-bold">// COURSE CURRICULUM</span>
          <h2 class="watch-heading font-['Hanken_Grotesk'] text-lg font-bold mt-1">{{ course()?.title }}</h2>
          <div class="flex items-center justify-between gap-3 mt-4">
            <span class="watch-muted font-['JetBrains_Mono'] text-[11px] uppercase">
              {{ course()?.modules?.length || 0 }} sections
            </span>
            <button
              type="button"
              (click)="toggleAllModules()"
              class="watch-accent font-['JetBrains_Mono'] text-[11px] uppercase hover:text-[#E8931A] transition-colors"
            >
              {{ allModulesExpanded() ? 'Collapse all' : 'Expand all' }}
            </button>
          </div>
        </div>

        <div class="flex-1 min-h-0 flex flex-col gap-3 overflow-y-auto pr-1" role="list" aria-label="Course curriculum">
          @for (module of course()?.modules; track module.id) {
            <section class="watch-section rounded overflow-hidden shrink-0" role="listitem">
              <button
                type="button"
                (click)="toggleModule(module.id)"
                [attr.aria-expanded]="isModuleExpanded(module.id)"
                class="watch-section-header w-full p-3.5 flex items-center justify-between gap-3 text-left transition-colors"
              >
                <span class="flex items-center gap-2 min-w-0">
                  <span class="material-symbols-outlined text-base text-[#E8931A]">
                    {{ isModuleExpanded(module.id) ? 'expand_less' : 'expand_more' }}
                  </span>
                  <span class="watch-heading font-['Hanken_Grotesk'] text-xs font-bold truncate">{{ module.title }}</span>
                </span>
                <span class="watch-muted font-['JetBrains_Mono'] text-[10px] whitespace-nowrap">
                  {{ module.lessons.length }} lectures
                </span>
              </button>

              @if (isModuleExpanded(module.id)) {
                <div class="divide-y divide-[#1E293B]/40">
                  @for (lesson of module.lessons; track lesson.id) {
                    <a
                      [routerLink]="['/courses', course()?.slug, 'watch', lesson.id]"
                      [class.bg-[#378ADD]/15]="lesson.id === currentLessonId()"
                      [class.watch-lesson-active]="lesson.id === currentLessonId()"
                      [class.watch-lesson-completed]="isLessonCompleted(lesson.id)"
                      [attr.aria-current]="lesson.id === currentLessonId() ? 'page' : null"
                      class="watch-lesson-link p-3.5 flex items-center justify-between gap-3 text-xs font-['Inter'] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8931A]"
                    >
                      <span class="flex items-center gap-2.5 min-w-0">
                        <span class="material-symbols-outlined text-sm text-[#378ADD]">
                          {{ isLessonCompleted(lesson.id) ? 'check_circle' : (lesson.id === currentLessonId() ? 'play_circle' : (lesson.isFreePreview ? 'lock_open' : 'ondemand_video')) }}
                        </span>
                        <span class="watch-lesson-title line-clamp-2">{{ lesson.title }}</span>
                      </span>

                      <span class="flex items-center gap-2 shrink-0">
                        @if (lesson.isFreePreview) {
                          <span class="watch-preview font-['JetBrains_Mono'] text-[10px] uppercase">Preview</span>
                        }
                        @if (isLessonCompleted(lesson.id)) {
                          <span class="watch-completed-label font-['JetBrains_Mono'] text-[10px] uppercase">Done</span>
                        }
                        <span class="watch-muted font-['JetBrains_Mono'] text-[11px]">
                          {{ Math.max(1, Math.round(lesson.duration / 60)) }}m
                        </span>
                      </span>
                    </a>
                  }
                </div>
              }
            </section>
          }
        </div>
      </aside>
    </div>
  `,
})
export class WatchComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private enrollmentsService = inject(EnrollmentsService);
  private coursesService = inject(CoursesService);
  private sanitizer = inject(DomSanitizer);
  private authService = inject(AuthService);

  course = signal<Course | null>(null);
  playbackData = signal<PlaybackTokenResponse | null>(null);
  safeEmbedUrl = signal<SafeResourceUrl | null>(null);
  playbackError = signal('');
  currentLessonId = signal<string>('');
  courseId = signal<string>('');
  isLoading = signal(true);
  completedLessonIds = signal<Set<string>>(new Set());
  progressError = signal('');
  expandedModules = signal<Set<string>>(new Set());

  private progressInterval: any;
  Math = Math;

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      const lessonId = params['lessonId'];
      this.currentLessonId.set(lessonId);
      this.isLoading.set(true);
      this.playbackData.set(null);
      this.safeEmbedUrl.set(null);
      this.playbackError.set('');
      this.completedLessonIds.set(new Set());
      this.progressError.set('');

      if (slug) {
        this.coursesService.getCourseBySlug(slug).subscribe({
          next: (c) => {
            this.course.set(c);
            this.courseId.set(c.id);
            this.loadCompletionStatus(c.id, lessonId);
            const activeModule = (c.modules || []).find((module) =>
              (module.lessons || []).some((lesson) => lesson.id === lessonId),
            );
            this.expandedModules.set(
              new Set([
                ...(c.modules || []).slice(0, 1).map((module) => module.id),
                ...(activeModule ? [activeModule.id] : []),
              ]),
            );
            this.loadVideoToken(lessonId);
          },
          error: (error) => {
            this.isLoading.set(false);
            this.playbackError.set(error?.error?.message || 'Course content could not be loaded.');
          },
        });
      }
    });

    // Save progress on interval every 10 seconds
    this.progressInterval = setInterval(() => {
      this.saveProgressInterval();
    }, 10000);
  }

  ngOnDestroy() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
    }
    this.saveProgressInterval();
  }

  @HostListener('window:beforeunload')
  onBeforeUnload() {
    this.saveProgressInterval();
  }

  loadVideoToken(lessonId: string) {
    this.isLoading.set(true);
    this.enrollmentsService.getVideoToken(lessonId).subscribe({
      next: (data) => {
        this.playbackData.set(data);
        this.playbackError.set('');
        this.safeEmbedUrl.set(
          data.embedUrl
            ? this.sanitizer.bypassSecurityTrustResourceUrl(data.embedUrl)
            : null,
        );
        this.isLoading.set(false);
        this.saveProgressInterval();
      },
      error: (error) => {
        this.isLoading.set(false);
        this.playbackData.set(null);
        this.safeEmbedUrl.set(null);
        this.playbackError.set(
          error?.error?.message || 'This lesson could not be opened. Please enroll or check the preview settings.',
        );
      },
    });
  }

  private loadCompletionStatus(courseId: string, lessonId: string) {
    if (!this.authService.isAuthenticated()) {
      this.completedLessonIds.set(new Set());
      return;
    }

    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (enrollments) => {
        const enrollment = enrollments.find((item) => item.courseId === courseId);
        const completedLessonIds = new Set(enrollment?.completedLessonIds || []);

        if (this.courseId() !== courseId || this.currentLessonId() !== lessonId) return;

        this.completedLessonIds.set(completedLessonIds);
      },
      error: () => {
        // Preview playback can still work for signed-out users or when the
        // progress endpoint is temporarily unavailable.
        if (this.courseId() === courseId && this.currentLessonId() === lessonId) {
          this.completedLessonIds.set(new Set());
        }
      },
    });
  }

  isLessonCompleted(lessonId: string): boolean {
    return this.completedLessonIds().has(lessonId);
  }

  isCurrentLessonCompleted(): boolean {
    return this.isLessonCompleted(this.currentLessonId());
  }

  private applyEnrollmentProgress(
    courseId: string,
    lessonId: string,
    completedLessonIds: string[] | undefined,
  ) {
    if (this.courseId() !== courseId) return;

    const completed = new Set(completedLessonIds || []);
    this.completedLessonIds.set(completed);
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
    return modules.length > 0 && modules.every((module) => this.expandedModules().has(module.id));
  }

  toggleAllModules() {
    const modules = this.course()?.modules || [];
    this.expandedModules.set(
      this.allModulesExpanded()
        ? new Set()
        : new Set(modules.map((module) => module.id)),
    );
  }

  saveProgressInterval() {
    const courseId = this.courseId();
    const lessonId = this.currentLessonId();
    if (this.authService.isAuthenticated() && courseId && lessonId) {
      this.enrollmentsService
        .updateProgress({
          courseId,
          lessonId,
          isCompleted: this.isCurrentLessonCompleted(),
        })
        .subscribe({
          next: (enrollment) => {
            this.applyEnrollmentProgress(courseId, lessonId, enrollment.completedLessonIds);
          },
        });
    }
  }

  markAsCompleted() {
    const courseId = this.courseId();
    const lessonId = this.currentLessonId();
    if (this.isCurrentLessonCompleted() || !this.authService.isAuthenticated() || !courseId || !lessonId) return;

    this.progressError.set('');

    const completed = new Set(this.completedLessonIds());
    completed.add(lessonId);
    this.completedLessonIds.set(completed);

    this.enrollmentsService
      .updateProgress({ courseId, lessonId, isCompleted: true })
      .subscribe({
        next: (enrollment) => {
          this.applyEnrollmentProgress(courseId, lessonId, enrollment.completedLessonIds);
        },
        error: (error) => {
          if (this.courseId() === courseId && this.currentLessonId() === lessonId) {
            const current = new Set(this.completedLessonIds());
            current.delete(lessonId);
            this.completedLessonIds.set(current);
            this.progressError.set(error?.error?.message || 'Progress could not be saved. Please try again.');
          }
        },
      });
  }
}
