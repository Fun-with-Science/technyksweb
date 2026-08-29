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
    <div class="pt-16 min-h-screen bg-[#040810] flex flex-col lg:flex-row">
      <!-- Main Video Player Container -->
      <div class="flex-grow p-4 lg:p-8 flex flex-col gap-4">
        @if (isLoading()) {
          <div class="w-full aspect-video bg-[#121A2B] technical-border rounded flex flex-col items-center justify-center">
            <span class="material-symbols-outlined animate-spin text-4xl text-[#E8931A] mb-2">progress_activity</span>
            <span class="font-['JetBrains_Mono'] text-xs text-[#378ADD]">Verifying protected lesson playback...</span>
          </div>
        } @else if (playbackData()?.videoAvailable && safeEmbedUrl()) {
          <div class="w-full aspect-video bg-black rounded overflow-hidden shadow-2xl relative border border-[#1E293B]">
            <iframe
              [src]="safeEmbedUrl()"
              class="w-full h-full border-0"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>

          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#121A2B] technical-border p-6 rounded">
            <div>
              <div class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-[11px] text-[#E8931A] mb-1">
                <span class="material-symbols-outlined text-sm">lock</span>
                {{ playbackData()?.provider === 'YOUTUBE' ? 'YOUTUBE MEMBERSHIP VIDEO' : 'TOKEN AUTHENTICATED BUNNY STREAM (EXPIRES IN 4H)' }}
              </div>
              <h1 class="font-['Hanken_Grotesk'] text-xl font-bold text-white">
                {{ playbackData()?.title }}
              </h1>
            </div>

            <button
              (click)="markAsCompleted()"
              [class.bg-[#378ADD]]="isCurrentCompleted()"
              [class.bg-[#E8931A]]="!isCurrentCompleted()"
              class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] px-5 py-3 rounded hover:opacity-90 transition-all flex items-center gap-2 shadow-md"
            >
              <span class="material-symbols-outlined text-sm">
                {{ isCurrentCompleted() ? 'check_circle' : 'task_alt' }}
              </span>
              {{ isCurrentCompleted() ? 'Lesson Completed' : 'Mark as Completed' }}
            </button>
          </div>
        } @else if (playbackData()) {
          <div class="w-full aspect-video bg-[#121A2B] technical-border rounded flex flex-col items-center justify-center p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-[#E8931A] mb-2">video_settings</span>
            <h3 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mb-2">Video not connected yet</h3>
            <p class="font-['Inter'] text-sm text-[#d9c3af] max-w-md">
              This lesson does not have a playable video source yet. Add a Bunny Stream video ID or a YouTube Membership video reference in the curriculum.
            </p>
          </div>
        } @else {
          <div class="w-full aspect-video bg-[#121A2B] technical-border rounded flex flex-col items-center justify-center p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-[#ffb4ab] mb-2">lock_person</span>
            <h3 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mb-2">
              {{ playbackError() ? 'This lesson is locked' : 'Streaming Unauthorized' }}
            </h3>
            <p class="font-['Inter'] text-sm text-[#d9c3af] max-w-md mb-6">
              {{ playbackError() || 'This is paid token-gated content. Please enroll in this track or join Membership to stream this lesson.' }}
            </p>
            <a routerLink="/courses" class="font-['JetBrains_Mono'] text-xs uppercase text-[#040810] bg-[#E8931A] px-6 py-3 rounded font-bold">
              Enroll in Track
            </a>
          </div>
        }
      </div>

      <!-- Right Drawer Curriculum Navigation Sidebar -->
      <aside class="w-full lg:w-96 bg-[#121A2B] border-l border-[#1E293B] p-6 flex flex-col gap-6 lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)]">
        <div class="shrink-0">
          <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#378ADD] font-bold">// TRACK CURRICULUM</span>
          <h2 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mt-1">{{ course()?.title }}</h2>
          <div class="flex items-center justify-between gap-3 mt-4">
            <span class="font-['JetBrains_Mono'] text-[11px] uppercase text-[#a18d7b]">
              {{ course()?.modules?.length || 0 }} sections
            </span>
            <button
              type="button"
              (click)="toggleAllModules()"
              class="font-['JetBrains_Mono'] text-[11px] uppercase text-[#378ADD] hover:text-[#E8931A] transition-colors"
            >
              {{ allModulesExpanded() ? 'Collapse all' : 'Expand all' }}
            </button>
          </div>
        </div>

        <div class="flex-1 flex flex-col gap-3 overflow-y-auto pr-1" role="list" aria-label="Course curriculum">
          @for (module of course()?.modules; track module.id) {
            <section class="border border-[#1E293B] rounded overflow-hidden" role="listitem">
              <button
                type="button"
                (click)="toggleModule(module.id)"
                [attr.aria-expanded]="isModuleExpanded(module.id)"
                class="w-full p-3.5 bg-[#040810] flex items-center justify-between gap-3 text-left border-b border-[#1E293B] hover:bg-[#0a1220] transition-colors"
              >
                <span class="flex items-center gap-2 min-w-0">
                  <span class="material-symbols-outlined text-base text-[#E8931A]">
                    {{ isModuleExpanded(module.id) ? 'expand_less' : 'expand_more' }}
                  </span>
                  <span class="font-['Hanken_Grotesk'] text-xs font-bold text-white truncate">{{ module.title }}</span>
                </span>
                <span class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b] whitespace-nowrap">
                  {{ module.lessons.length }} lectures
                </span>
              </button>

              @if (isModuleExpanded(module.id)) {
                <div class="divide-y divide-[#1E293B]/40">
                  @for (lesson of module.lessons; track lesson.id) {
                    <a
                      [routerLink]="['/courses', course()?.slug, 'watch', lesson.id]"
                      [class.bg-[#378ADD]/15]="lesson.id === currentLessonId()"
                      [attr.aria-current]="lesson.id === currentLessonId() ? 'page' : null"
                      class="p-3.5 flex items-center justify-between gap-3 text-xs font-['Inter'] hover:bg-[#040810]/60 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#E8931A]"
                    >
                      <span class="flex items-center gap-2.5 min-w-0">
                        <span class="material-symbols-outlined text-sm text-[#378ADD]">
                          {{ lesson.id === currentLessonId() ? 'play_circle' : (lesson.isFreePreview ? 'lock_open' : 'ondemand_video') }}
                        </span>
                        <span class="text-[#e0e3e5] line-clamp-2">{{ lesson.title }}</span>
                      </span>

                      <span class="flex items-center gap-2 shrink-0">
                        @if (lesson.isFreePreview) {
                          <span class="font-['JetBrains_Mono'] text-[10px] uppercase text-[#E8931A]">Preview</span>
                        }
                        <span class="font-['JetBrains_Mono'] text-[11px] text-[#a18d7b]">
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
  isCurrentCompleted = signal(false);
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
      this.isCurrentCompleted.set(false);

      if (slug) {
        this.coursesService.getCourseBySlug(slug).subscribe({
          next: (c) => {
            this.course.set(c);
            this.courseId.set(c.id);
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
    if (
      this.authService.isAuthenticated() &&
      this.courseId() &&
      this.currentLessonId()
    ) {
      this.enrollmentsService
        .updateProgress({
          courseId: this.courseId(),
          lessonId: this.currentLessonId(),
          isCompleted: this.isCurrentCompleted(),
        })
        .subscribe();
    }
  }

  markAsCompleted() {
    this.isCurrentCompleted.set(true);
    this.saveProgressInterval();
  }
}
