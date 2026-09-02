import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CoursesService, Course } from '../../core/services/courses.service';
import { CourseCardComponent } from '../../core/components/course-card/course-card.component';

@Component({
  selector: 'app-courses-catalog',
  standalone: true,
  imports: [CommonModule, RouterModule, CourseCardComponent],
  template: `
    <div class="px-5 sm:px-8 xl:px-12 pt-24 pb-20 max-w-[1400px] mx-auto">
      <div class="mb-10">
        <div
          class="font-['JetBrains_Mono'] text-[11px] uppercase tracking-[0.22em] text-[#3B82F6] mb-4"
        >
          Technyks Academy / Course catalog
        </div>
        <div
          class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5"
        >
          <div>
            <h1
              class="font-['Hanken_Grotesk'] text-4xl md:text-5xl font-bold text-white mb-3"
            >
              Premium Courses
            </h1>
            <p
              class="font-['Inter'] text-base md:text-lg text-[#d9c3af] max-w-2xl"
            >
              Practical engineering programs for building production-grade
              products, AI systems, and scalable SaaS.
            </p>
          </div>
          <div
            class="flex items-center gap-3 text-xs font-['JetBrains_Mono'] text-[#a18d7b]"
          >
            <span
              class="w-2 h-2 rounded-full bg-[#3B82F6] shadow-[0_0_12px_#3B82F6]"
            ></span>
            {{ courses().length }} courses available
          </div>
        </div>
      </div>

      <div
        class="flex flex-wrap items-center justify-between gap-4 mb-8 border-y border-[#1E293B] py-4"
      >
        <div class="flex flex-wrap gap-2">
          @for (level of levels; track level) {
            <button
              (click)="selectedLevel.set(level)"
              [class.bg-[#3B82F6]]="selectedLevel() === level"
              [class.text-[#040810]]="selectedLevel() === level"
              [class.font-bold]="selectedLevel() === level"
              [class.bg-[#121A2B]]="selectedLevel() !== level"
              [class.text-[#d9c3af]]="selectedLevel() !== level"
              class="font-['JetBrains_Mono'] text-xs uppercase tracking-wider px-4 py-2 rounded border border-[#1E293B] hover:border-[#3B82F6] transition-colors"
            >
              {{ level }}
            </button>
          }
        </div>

        <div
          class="font-['JetBrains_Mono'] text-xs text-[#3B82F6] uppercase tracking-wider"
        >
          Showing {{ filteredCourses().length }} courses
        </div>
      </div>

      @if (isLoading()) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (i of [1, 2, 3, 4]; track i) {
            <div
              class="bg-[#121A2B] border border-[#1E293B] rounded-lg overflow-hidden animate-pulse"
            >
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
      } @else if (filteredCourses().length) {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          @for (course of filteredCourses(); track course.id) {
            <app-course-card [course]="course" />
          }
        </div>
      } @else {
        <div
          class="border border-dashed border-[#3B82F6]/50 rounded-lg px-6 py-16 text-center"
        >
          <span class="material-symbols-outlined text-4xl text-[#3B82F6] mb-3"
            >school</span
          >
          <h2
            class="font-['Hanken_Grotesk'] text-2xl font-bold text-white mb-2"
          >
            {{
              courses().length
                ? 'No courses match this filter'
                : 'No courses are live right now'
            }}
          </h2>
          <p class="font-['Inter'] text-sm text-[#a18d7b] max-w-xl mx-auto">
            {{
              courses().length
                ? 'Try selecting another level to see available courses.'
                : 'New courses will appear here after they are published from the admin panel.'
            }}
          </p>
        </div>
      }
    </div>
  `,
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
    return this.courses().filter(
      (c) => c.level.toLowerCase() === level.toLowerCase(),
    );
  };
}
