import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService, Course } from '../../core/services/courses.service';

@Component({
  selector: 'app-courses-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-5 sm:px-8 xl:px-12 pt-24 pb-20 max-w-[1400px] mx-auto">
      <div class="mb-10">
        <div class="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.22em] text-[#378ADD] mb-4">
          Technyks Academy / Course catalog
        </div>
        <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div>
            <h1 class="font-['Hanken_Grotesk'] text-4xl md:text-5xl font-bold text-white mb-3">Premium Courses</h1>
            <p class="font-['Inter'] text-base md:text-lg text-[#d9c3af] max-w-2xl">
              Practical engineering programs for building production-grade products, AI systems, and scalable SaaS.
            </p>
          </div>
          <div class="flex items-center gap-3 text-xs font-['JetBrains_Mono'] text-[#a18d7b]">
            <span class="w-2 h-2 rounded-full bg-[#E8931A] shadow-[0_0_12px_#E8931A]"></span>
            {{ courses().length }} courses available
          </div>
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-between gap-4 mb-8 border-y border-[#1E293B] py-4">
        <div class="flex flex-wrap gap-2">
          @for (level of levels; track level) {
            <button
              (click)="selectedLevel.set(level)"
              [class.bg-[#E8931A]]="selectedLevel() === level"
              [class.text-[#040810]]="selectedLevel() === level"
              [class.font-bold]="selectedLevel() === level"
              [class.bg-[#121A2B]]="selectedLevel() !== level"
              [class.text-[#d9c3af]]="selectedLevel() !== level"
              class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider px-4 py-2 rounded border border-[#1E293B] hover:border-[#378ADD] transition-colors"
            >
              {{ level }}
            </button>
          }
        </div>

        <div class="font-['JetBrains_Mono'] text-xs text-[#378ADD] uppercase tracking-wider">
          Showing {{ filteredCourses().length }} courses
        </div>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (i of [1,2,3,4]; track i) {
            <div class="bg-[#121A2B] border border-[#1E293B] rounded-lg overflow-hidden animate-pulse">
              <div class="aspect-video bg-[#1E293B]"></div>
              <div class="p-5">
                <div class="h-4 bg-[#1E293B] rounded w-1/3 mb-4"></div>
                <div class="h-6 bg-[#1E293B] rounded w-4/5 mb-3"></div>
                <div class="h-10 bg-[#1E293B] rounded w-full mb-5"></div>
                <div class="h-4 bg-[#1E293B] rounded w-2/5"></div>
              </div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (course of filteredCourses(); track course.id) {
            <article class="bg-[#121A2B] border border-[#1E293B] rounded-lg flex flex-col overflow-hidden group hover:border-[#378ADD] transition-all shadow-xl">
              @if (course.thumbnail) {
                <div class="relative w-full aspect-video overflow-hidden border-b border-[#1E293B] bg-[#040810]">
                  <img
                    [src]="course.thumbnail"
                    [alt]="course.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#121A2B] via-transparent to-transparent opacity-80"></div>
                  <span class="absolute top-3 left-3 font-['JetBrains_Mono'] text-[10px] text-[#040810] bg-[#E8931A] px-2.5 py-1 rounded font-bold uppercase">
                    Premium
                  </span>
                  <span class="absolute top-3 right-3 font-['JetBrains_Mono'] text-[10px] text-white bg-[#040810]/90 backdrop-blur-md border border-[#378ADD]/40 px-2.5 py-1 rounded font-semibold uppercase">
                    {{ course.level }}
                  </span>
                </div>
              }

              <div class="p-5 flex flex-col flex-1">
                <h2 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mb-2 group-hover:text-[#E8931A] transition-colors leading-snug">
                  {{ course.title }}
                </h2>

                <p class="font-['Inter'] text-sm text-[#d9c3af] mb-5 line-clamp-2 leading-relaxed">
                  {{ course.subtitle }}
                </p>

                <div class="grid grid-cols-2 gap-y-3 gap-x-2 pt-4 border-t border-[#1E293B]/60 font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] mt-auto">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-[#378ADD]">schedule</span>
                    {{ formatDuration(course) }}
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-[#378ADD]">layers</span>
                    {{ getTotalModules(course) }} sections
                  </div>
                  <div class="flex items-center gap-1.5 col-span-2">
                    <span class="material-symbols-outlined text-sm text-[#378ADD]">play_lesson</span>
                    {{ getTotalLessons(course) }} lessons · certificate included
                  </div>
                </div>
              </div>

              <div class="px-5 py-4 flex items-center justify-between border-t border-[#1E293B]/40 bg-[#0b0f10]/40">
                <div class="font-['JetBrains_Mono'] text-lg font-bold text-[#E8931A]">
                  ₹{{ course.price.toLocaleString('en-IN') }}
                </div>
                <a
                  [routerLink]="['/courses', course.slug]"
                  class="font-['JetBrains_Mono'] text-xs font-bold text-[#378ADD] hover:text-[#E8931A] flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  View course
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </article>
          }
        </div>
      }
    </div>
  `
})
export class CoursesCatalogComponent implements OnInit {
  private coursesService = inject(CoursesService);

  courses = signal<Course[]>([]);
  isLoading = signal(true);
  selectedLevel = signal('ALL');
  levels = ['ALL', 'Beginner', 'Intermediate', 'Advanced'];

  ngOnInit() {
    this.coursesService.getCourses().subscribe({
      next: (data) => {
        this.courses.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  filteredCourses = () => {
    const level = this.selectedLevel();
    if (level === 'ALL') return this.courses();
    return this.courses().filter(c => c.level.toLowerCase() === level.toLowerCase());
  };

  getTotalDurationMinutes(course: Course): number {
    if (!course.modules) return 0;
    let total = 0;
    course.modules.forEach(m => m.lessons?.forEach(l => total += l.duration || 0));
    return Math.round(total / 60);
  }

  getTotalLessons(course: Course): number {
    if (!course.modules) return 0;
    let count = 0;
    course.modules.forEach(m => count += m.lessons?.length || 0);
    return count;
  }

  getTotalModules(course: Course): number {
    return course.modules?.length || 0;
  }

  formatDuration(course: Course): string {
    const minutes = this.getTotalDurationMinutes(course);
    if (minutes < 60) return `${minutes} mins`;
    const hours = Math.floor(minutes / 60);
    const remainder = minutes % 60;
    return remainder ? `${hours}h ${remainder}m` : `${hours}h`;
  }
}
