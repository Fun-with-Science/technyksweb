import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EnrollmentsService, Enrollment } from '../../core/services/enrollments.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-6 md:px-16 pt-24 pb-20 max-w-7xl mx-auto">
      <!-- Welcome Header -->
      <div class="mb-10 border-b border-[#1E293B] pb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#3B82F6] px-3.5 py-1.5 border border-[#3B82F6]/30 bg-[#3B82F6]/10 rounded-full w-fit mb-3">
            <span class="material-symbols-outlined text-[16px]">dashboard</span>
            STUDENT DASHBOARD
          </div>
          <h1 class="font-['Hanken_Grotesk'] text-3xl md:text-4xl font-bold text-white">
            Welcome back, {{ authService.currentUser()?.name }}
          </h1>
          <p class="font-['Inter'] text-sm text-[#d9c3af] mt-1">
            Keep your learning momentum going and pick up where you left off.
          </p>
        </div>

        <a routerLink="/courses" class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider text-[#040810] bg-[#3B82F6] px-5 py-3 rounded font-bold hover:bg-[#3B82F6]/90 transition-colors flex items-center gap-2 shadow-md">
          <span class="material-symbols-outlined text-sm">add</span>
          Browse More Courses
        </a>
      </div>

      @if (!isLoading() && enrollments().length > 0) {
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div class="bg-[#121A2B] technical-border rounded p-5">
            <p class="font-['JetBrains_Mono'] text-[11px] tracking-wider text-[#a18d7b]">ENROLLED COURSES</p>
            <p class="font-['Hanken_Grotesk'] text-3xl font-bold text-white mt-2">{{ enrollments().length }}</p>
          </div>
          <div class="bg-[#121A2B] technical-border rounded p-5">
            <p class="font-['JetBrains_Mono'] text-[11px] tracking-wider text-[#a18d7b]">AVERAGE PROGRESS</p>
            <p class="font-['Hanken_Grotesk'] text-3xl font-bold text-[#3B82F6] mt-2">{{ averageProgress() }}%</p>
          </div>
          <div class="bg-[#121A2B] technical-border rounded p-5">
            <p class="font-['JetBrains_Mono'] text-[11px] tracking-wider text-[#a18d7b]">COMPLETED COURSES</p>
            <p class="font-['Hanken_Grotesk'] text-3xl font-bold text-white mt-2">{{ completedCourses() }}</p>
          </div>
        </div>
      }

      <!-- Enrolled Courses Grid -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          @for (i of [1,2]; track i) {
            <div class="bg-[#121A2B] technical-border rounded p-6 h-64 animate-pulse">
              <div class="h-6 bg-[#1E293B] rounded w-2/3 mb-4"></div>
              <div class="h-4 bg-[#1E293B] rounded w-1/3 mb-6"></div>
              <div class="h-12 bg-[#1E293B] rounded w-full"></div>
            </div>
          }
        </div>
      } @else if (enrollments().length === 0) {
        <div class="bg-[#121A2B] technical-border rounded p-12 text-center max-w-2xl mx-auto">
          <span class="material-symbols-outlined text-4xl text-[#3B82F6] mb-3">school</span>
          <h3 class="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-2">No Enrolled Courses Yet</h3>
          <p class="font-['Inter'] text-sm text-[#d9c3af] mb-6">
            You haven't enrolled in any architecture courses yet. Explore our course catalog or join the Pro Membership!
          </p>
          <a routerLink="/courses" class="inline-flex font-['JetBrains_Mono'] text-xs uppercase text-[#040810] bg-[#3B82F6] px-6 py-3 rounded font-bold hover:bg-[#3B82F6]/90 transition-colors">
            Explore Architecture Catalog
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          @for (enrollment of enrollments(); track enrollment.id) {
            <div class="bg-[#121A2B] technical-border rounded p-6 flex flex-col justify-between shadow-xl">
              <div>
                <div class="flex justify-between items-start mb-4">
                  <span class="font-['JetBrains_Mono'] text-[11px] text-[#3B82F6] bg-[#3B82F6]/10 px-2.5 py-1 border border-[#3B82F6]/30 rounded">
                    {{ getProgressPercent(enrollment) === 100 ? 'COMPLETED' : 'IN PROGRESS' }}
                  </span>
                  <span class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] font-bold">
                    {{ getProgressPercent(enrollment) }}% COMPLETE
                  </span>
                </div>

                <h2 class="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-2">
                  {{ enrollment.course.title }}
                </h2>

                <p class="font-['Inter'] text-xs text-[#d9c3af] mb-5 line-clamp-2">
                  {{ enrollment.course.subtitle }}
                </p>

                <div class="mb-6" aria-label="Course progress">
                  <div class="flex justify-between text-[11px] font-['JetBrains_Mono'] text-[#a18d7b] mb-2">
                    <span>COURSE PROGRESS</span>
                    <span>{{ getCompletedLessons(enrollment) }} of {{ getTotalLessons(enrollment) }} lessons</span>
                  </div>
                  <div class="h-3 w-full bg-[#040810] border border-[#1E293B] rounded p-0.5" role="progressbar" [attr.aria-valuenow]="getProgressPercent(enrollment)" aria-valuemin="0" aria-valuemax="100">
                    <div
                      class="h-full bg-[#3B82F6] rounded-sm transition-all duration-500"
                      [style.width.%]="getProgressPercent(enrollment)"
                    ></div>
                  </div>
                  <div class="flex justify-between items-center mt-3 text-xs text-[#d9c3af]">
                    <span>{{ getRemainingLessons(enrollment) }} lessons remaining</span>
                    <span class="text-right">{{ getLastLessonTitle(enrollment) }}</span>
                  </div>
                </div>
              </div>

              <div class="pt-4 border-t border-[#1E293B] flex items-center justify-between">
                <a
                  [routerLink]="['/courses', enrollment.course.slug, 'watch', getResumeLessonId(enrollment)]"
                  class="font-['JetBrains_Mono'] text-xs uppercase font-bold text-[#040810] bg-[#3B82F6] px-5 py-2.5 rounded hover:bg-[#3B82F6]/90 transition-colors flex items-center gap-1.5"
                >
                  <span class="material-symbols-outlined text-sm">play_arrow</span>
                  {{ getProgressPercent(enrollment) === 100 ? 'Review Course' : 'Continue Learning' }}
                </a>

                @if (getProgressPercent(enrollment) === 100) {
                  <button
                    (click)="downloadCertificate(enrollment.course.id)"
                    class="font-['JetBrains_Mono'] text-xs font-bold text-[#3B82F6] hover:underline flex items-center gap-1"
                  >
                    <span class="material-symbols-outlined text-sm">workspace_premium</span>
                    Certificate
                  </button>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class DashboardComponent implements OnInit {
  authService = inject(AuthService);
  private enrollmentsService = inject(EnrollmentsService);

  enrollments = signal<Enrollment[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.enrollmentsService.getMyEnrollments().subscribe({
      next: (data) => {
        this.enrollments.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getResumeLessonId(enrollment: Enrollment): string {
    if (enrollment.lastWatchedLessonId) return enrollment.lastWatchedLessonId;
    if (enrollment.course.modules?.[0]?.lessons?.[0]?.id) {
      return enrollment.course.modules[0].lessons[0].id;
    }
    return 'les-1';
  }

  getTotalLessons(enrollment: Enrollment): number {
    return enrollment.course.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 0;
  }

  getCompletedLessons(enrollment: Enrollment): number {
    const totalLessons = this.getTotalLessons(enrollment);
    const completedLessonIds = new Set(enrollment.completedLessonIds || []);
    return totalLessons ? Math.min(totalLessons, completedLessonIds.size) : 0;
  }

  getProgressPercent(enrollment: Enrollment): number {
    const totalLessons = this.getTotalLessons(enrollment);
    if (totalLessons) {
      return Math.round((this.getCompletedLessons(enrollment) / totalLessons) * 100);
    }
    return Math.max(0, Math.min(100, Math.round(Number(enrollment.progressPercent) || 0)));
  }

  getRemainingLessons(enrollment: Enrollment): number {
    return Math.max(0, this.getTotalLessons(enrollment) - this.getCompletedLessons(enrollment));
  }

  getLastLessonTitle(enrollment: Enrollment): string {
    if (!enrollment.lastWatchedLessonId) return 'Not started yet';
    for (const module of enrollment.course.modules || []) {
      const lesson = module.lessons?.find(item => item.id === enrollment.lastWatchedLessonId);
      if (lesson) return `Last viewed: ${lesson.title}`;
    }
    return 'Continue your course';
  }

  averageProgress(): number {
    const courses = this.enrollments();
    if (!courses.length) return 0;
    return Math.round(courses.reduce((total, enrollment) => total + this.getProgressPercent(enrollment), 0) / courses.length);
  }

  completedCourses(): number {
    return this.enrollments().filter(enrollment => this.getProgressPercent(enrollment) === 100).length;
  }

  downloadCertificate(courseId: string) {
    this.enrollmentsService.getCertificate(courseId).subscribe({
      next: (cert) => {
        alert(`Certificate issued!\nCertificate #: ${cert.certificateNumber}\nURL: ${cert.pdfUrl}`);
      }
    });
  }
}
