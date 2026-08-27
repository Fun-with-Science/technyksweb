import { Component, signal, inject, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EnrollmentsService, PlaybackTokenResponse } from '../../core/services/enrollments.service';
import { CoursesService, Course } from '../../core/services/courses.service';

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
            <span class="font-['JetBrains_Mono'] text-xs text-[#378ADD]">Verifying Tokenized Bunny Stream Embed...</span>
          </div>
        } @else if (playbackData()) {
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
                TOKEN AUTHENTICATED STREAM (EXPIRES IN 4H)
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
        } @else {
          <div class="w-full aspect-video bg-[#121A2B] technical-border rounded flex flex-col items-center justify-center p-8 text-center">
            <span class="material-symbols-outlined text-4xl text-[#ffb4ab] mb-2">lock_person</span>
            <h3 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mb-2">Streaming Unauthorized</h3>
            <p class="font-['Inter'] text-sm text-[#d9c3af] max-w-md mb-6">
              This is paid token-gated content. Please enroll in this track or join Membership to stream this lesson.
            </p>
            <a routerLink="/courses" class="font-['JetBrains_Mono'] text-xs uppercase text-[#040810] bg-[#E8931A] px-6 py-3 rounded font-bold">
              Enroll in Track
            </a>
          </div>
        }
      </div>

      <!-- Right Drawer Curriculum Navigation Sidebar -->
      <div class="w-full lg:w-96 bg-[#121A2B] border-l border-[#1E293B] p-6 flex flex-col gap-6">
        <div>
          <span class="font-['JetBrains_Mono'] text-xs uppercase text-[#378ADD] font-bold">// TRACK CURRICULUM</span>
          <h2 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mt-1">{{ course()?.title }}</h2>
        </div>

        <div class="flex flex-col gap-4 overflow-y-auto max-h-[75vh]">
          @for (module of course()?.modules; track module.id) {
            <div class="border border-[#1E293B] rounded overflow-hidden">
              <div class="p-3.5 bg-[#040810] font-['Hanken_Grotesk'] text-xs font-bold text-white border-b border-[#1E293B]">
                {{ module.title }}
              </div>
              <div class="divide-y divide-[#1E293B]/40">
                @for (lesson of module.lessons; track lesson.id) {
                  <a
                    [routerLink]="['/courses', course()?.slug, 'watch', lesson.id]"
                    [class.bg-[#378ADD]/15]="lesson.id === currentLessonId()"
                    class="p-3.5 flex items-center justify-between text-xs font-['Inter'] hover:bg-[#040810]/60 transition-colors"
                  >
                    <div class="flex items-center gap-2.5">
                      <span class="material-symbols-outlined text-sm text-[#378ADD]">
                        {{ lesson.id === currentLessonId() ? 'play_circle' : 'ondemand_video' }}
                      </span>
                      <span class="text-[#e0e3e5] line-clamp-1">{{ lesson.title }}</span>
                    </div>

                    <span class="font-['JetBrains_Mono'] text-[11px] text-[#a18d7b]">
                      {{ Math.round(lesson.duration / 60) }}m
                    </span>
                  </a>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class WatchComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private enrollmentsService = inject(EnrollmentsService);
  private coursesService = inject(CoursesService);
  private sanitizer = inject(DomSanitizer);

  course = signal<Course | null>(null);
  playbackData = signal<PlaybackTokenResponse | null>(null);
  safeEmbedUrl = signal<SafeResourceUrl | null>(null);
  currentLessonId = signal<string>('');
  courseId = signal<string>('');
  isLoading = signal(true);
  isCurrentCompleted = signal(false);

  private progressInterval: any;
  Math = Math;

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      const lessonId = params['lessonId'];
      this.currentLessonId.set(lessonId);

      if (slug) {
        this.coursesService.getCourseBySlug(slug).subscribe({
          next: (c) => {
            this.course.set(c);
            this.courseId.set(c.id);
            this.loadVideoToken(lessonId);
          }
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
        this.safeEmbedUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(data.embedUrl));
        this.isLoading.set(false);
        this.saveProgressInterval();
      },
      error: () => {
        this.isLoading.set(false);
        this.playbackData.set(null);
      }
    });
  }

  saveProgressInterval() {
    if (this.courseId() && this.currentLessonId()) {
      this.enrollmentsService.updateProgress({
        courseId: this.courseId(),
        lessonId: this.currentLessonId(),
        isCompleted: this.isCurrentCompleted(),
      }).subscribe();
    }
  }

  markAsCompleted() {
    this.isCurrentCompleted.set(true);
    this.saveProgressInterval();
  }
}
