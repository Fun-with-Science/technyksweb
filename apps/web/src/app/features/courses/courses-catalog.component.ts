import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService, Course } from '../../core/services/courses.service';

@Component({
  selector: 'app-courses-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="px-6 md:px-16 pt-24 pb-20 max-w-7xl mx-auto">
      <!-- Header Section -->
      <div class="mb-12">
        <div class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#378ADD] px-3.5 py-1.5 border border-[#378ADD]/30 bg-[#378ADD]/10 rounded-full w-fit mb-4">
          <span class="material-symbols-outlined text-[16px]">terminal</span>
          ARCHITECTURAL CURRICULUM
        </div>
        <h1 class="font-['Hanken_Grotesk'] text-4xl md:text-5xl font-bold text-white mb-4">Software Architecture Tracks</h1>
        <p class="font-['Inter'] text-lg text-[#d9c3af] max-w-3xl border-l-2 border-[#1E293B] pl-4">
          Bespoke engineering tracks designed to turn feature developers into system architects. High-signal content with zero fluff.
        </p>
      </div>

      <!-- Filter Controls -->
      <div class="flex flex-wrap items-center justify-between gap-4 mb-8 border-b border-[#1E293B] pb-6">
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

        <div class="font-['JetBrains_Mono'] text-xs text-[#378ADD]">
          Showing {{ filteredCourses().length }} Tracks
        </div>
      </div>

      <!-- Courses Grid -->
      @if (isLoading()) {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          @for (i of [1,2,3]; track i) {
            <div class="bg-[#121A2B] technical-border rounded p-6 h-64 animate-pulse">
              <div class="h-4 bg-[#1E293B] rounded w-1/4 mb-4"></div>
              <div class="h-6 bg-[#1E293B] rounded w-3/4 mb-4"></div>
              <div class="h-16 bg-[#1E293B] rounded w-full mb-6"></div>
            </div>
          }
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @for (course of filteredCourses(); track course.id) {
            <div class="bg-[#121A2B] technical-border rounded flex flex-col justify-between overflow-hidden group hover:border-[#378ADD] transition-all shadow-xl">
              <!-- Thumbnail Banner -->
              @if (course.thumbnail) {
                <div class="relative w-full h-44 overflow-hidden border-b border-[#1E293B]">
                  <img
                    [src]="course.thumbnail"
                    [alt]="course.title"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div class="absolute inset-0 bg-gradient-to-t from-[#121A2B] via-transparent to-transparent opacity-80"></div>
                  
                  <span class="absolute top-3 left-3 font-['JetBrains_Mono'] text-[10px] text-[#378ADD] bg-[#040810]/90 backdrop-blur-md px-2.5 py-1 border border-[#378ADD]/40 rounded">
                    v2.1.0
                  </span>
                  
                  <span class="absolute top-3 right-3 font-['JetBrains_Mono'] text-[10px] text-[#378ADD] bg-[#040810]/90 backdrop-blur-md border border-[#378ADD]/40 px-2.5 py-1 rounded font-semibold uppercase">
                    Membership
                  </span>
                </div>
              }

              <div class="p-6">
                <h2 class="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-2 group-hover:text-[#E8931A] transition-colors">
                  {{ course.title }}
                </h2>

                <p class="font-['Inter'] text-sm text-[#d9c3af] mb-6 line-clamp-2">
                  {{ course.subtitle }}
                </p>

                <div class="grid grid-cols-2 gap-4 pt-4 border-t border-[#1E293B]/60 font-['JetBrains_Mono'] text-xs text-[#a18d7b]">
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-[#378ADD]">schedule</span>
                    {{ getTotalDurationMinutes(course) }} mins
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span class="material-symbols-outlined text-sm text-[#378ADD]">layers</span>
                    {{ getTotalLessons(course) }} Lessons
                  </div>
                </div>
              </div>

              <div class="p-6 pt-0 mt-auto flex items-center justify-between border-t border-[#1E293B]/40 bg-[#0b0f10]/40">
                <div class="font-['JetBrains_Mono'] text-lg font-bold text-[#E8931A]">
                  ₹{{ course.price.toLocaleString('en-IN') }}
                </div>
                <a
                  [routerLink]="['/courses', course.slug]"
                  class="font-['JetBrains_Mono'] text-xs font-bold text-[#378ADD] hover:text-[#E8931A] flex items-center gap-1 group-hover:gap-2 transition-all"
                >
                  Explore Track
                  <span class="material-symbols-outlined text-sm">arrow_forward</span>
                </a>
              </div>
            </div>
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
}
