import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import {
  AdminService,
  RevenueMetrics,
  Student,
  Coupon,
} from '../../core/services/admin.service';
import { CoursesService, Course } from '../../core/services/courses.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#040810] text-[#e0e3e5] pt-24 pb-20 px-6 md:px-16 max-w-7xl mx-auto">
      
      <!-- Top Udemy Instructor Header -->
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#1E293B] pb-6">
        <div>
          <div class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#E8931A] px-3.5 py-1.5 border border-[#E8931A]/30 bg-[#E8931A]/10 rounded-full w-fit mb-2">
            <span class="material-symbols-outlined text-[16px]">school</span>
            UDEMY INSTRUCTOR STUDIO
          </div>
          <h1 class="font-['Hanken_Grotesk'] text-3xl font-bold text-white">Course Management & Dashboard</h1>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            (click)="importJavaScriptCourse()"
            class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#E8931A] hover:bg-[#f6a52a] px-5 py-3 rounded-lg shadow-lg flex items-center gap-2 w-fit"
          >
            <span class="material-symbols-outlined text-sm">code</span>
            Add JavaScript Course
          </button>
          <button (click)="createNewCourse()" class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-white bg-[#6B21A8] hover:bg-[#7E22CE] px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 w-fit">
            <span class="material-symbols-outlined text-sm">add</span>
            New Course
          </button>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <div class="flex gap-6 border-b border-[#1E293B] mb-8 font-['JetBrains_Mono'] text-xs uppercase">
        <button
          (click)="activeTab.set('courses')"
          [class.border-b-2]="activeTab() === 'courses'"
          [class.border-[#E8931A]]="activeTab() === 'courses'"
          [class.text-[#E8931A]]="activeTab() === 'courses'"
          [class.text-[#d9c3af]]="activeTab() !== 'courses'"
          class="pb-3 px-1 font-bold transition-colors"
        >
          Courses (Udemy Roster)
        </button>

        <button
          (click)="activeTab.set('revenue')"
          [class.border-b-2]="activeTab() === 'revenue'"
          [class.border-[#E8931A]]="activeTab() === 'revenue'"
          [class.text-[#E8931A]]="activeTab() === 'revenue'"
          [class.text-[#d9c3af]]="activeTab() !== 'revenue'"
          class="pb-3 px-1 font-bold transition-colors"
        >
          Analytics & Revenue
        </button>

        <button
          (click)="activeTab.set('students')"
          [class.border-b-2]="activeTab() === 'students'"
          [class.border-[#E8931A]]="activeTab() === 'students'"
          [class.text-[#E8931A]]="activeTab() === 'students'"
          [class.text-[#d9c3af]]="activeTab() !== 'students'"
          class="pb-3 px-1 font-bold transition-colors"
        >
          Students
        </button>

        <button
          (click)="activeTab.set('coupons')"
          [class.border-b-2]="activeTab() === 'coupons'"
          [class.border-[#E8931A]]="activeTab() === 'coupons'"
          [class.text-[#E8931A]]="activeTab() === 'coupons'"
          [class.text-[#d9c3af]]="activeTab() !== 'coupons'"
          class="pb-3 px-1 font-bold transition-colors"
        >
          Coupons
        </button>
      </div>

      <!-- TAB 1: UDEMY COURSES ROSTER (Screenshot 1) -->
      @if (activeTab() === 'courses') {
        <div class="flex flex-col gap-6">
          
          <!-- Filter & Search Action Bar (Screenshot 1 Top Control) -->
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#121A2B] technical-border p-4 rounded-lg">
            <div class="flex items-center gap-3 w-full sm:w-auto flex-grow max-w-md">
              <input
                type="text"
                [(ngModel)]="searchCourseQuery"
                placeholder="Search your courses..."
                class="w-full bg-[#040810] border border-[#1E293B] focus:border-[#E8931A] focus:outline-none rounded px-4 py-2 text-xs text-white font-['Inter']"
              />
            </div>

            <div class="flex items-center gap-3 w-full sm:w-auto justify-end">
              <select
                [(ngModel)]="sortBy"
                class="bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-[#d9c3af] font-['JetBrains_Mono']"
              >
                <option value="Newest">Newest</option>
                <option value="Oldest">Oldest</option>
                <option value="Popular">Most Popular</option>
              </select>
            </div>
          </div>

          <!-- Course Cards Roster (Screenshot 1 Layout) -->
          @if (filteredCourses().length) {
            <div class="flex flex-col gap-4">
              @for (course of filteredCourses(); track course.id) {
                <div class="bg-[#121A2B] border border-[#1E293B] hover:border-[#378ADD] rounded-lg p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all group shadow-xl">
                
                <!-- Left: Thumbnail & Title -->
                <div class="flex items-center gap-5 flex-grow">
                  <div class="relative w-36 h-20 rounded overflow-hidden shrink-0 border border-[#1E293B]">
                    <img [src]="course.thumbnail || '/assets/agentic-ai.jpg'" class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  </div>

                  <div class="flex flex-col gap-1.5">
                    <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white group-hover:text-[#E8931A] transition-colors">
                      {{ course.title }}
                    </h3>

                    <div class="flex items-center gap-3 font-['JetBrains_Mono'] text-[11px]">
                      <span
                        [class.bg-[#378ADD]/20]="course.status === 'LIVE'"
                        [class.text-[#378ADD]]="course.status === 'LIVE'"
                        [class.bg-[#E8931A]/20]="course.status === 'DRAFT'"
                        [class.text-[#E8931A]]="course.status === 'DRAFT'"
                        class="px-2 py-0.5 rounded font-bold uppercase border border-current"
                      >
                        {{ course.status || 'LIVE' }}
                      </span>
                      <span class="text-[#a18d7b]">{{ course.isPublished ? 'Public' : 'Private' }}</span>
                      <span class="text-[#1E293B]">|</span>
                      <span class="text-[#378ADD]">{{ course.isFree ? 'FREE' : '₹' + course.price.toLocaleString('en-IN') }}</span>
                    </div>
                  </div>
                </div>

                <!-- Right: Stats & Action Button (Screenshot 1 Metrics) -->
                <div class="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-[#1E293B] pt-4 md:pt-0">
                  <div class="flex flex-col text-right font-['JetBrains_Mono']">
                    <span class="text-sm font-bold text-[#E8931A]">₹{{ (course.earnedThisMonth || 0).toLocaleString('en-IN') }}</span>
                    <span class="text-[10px] text-[#a18d7b]">Earned this month</span>
                  </div>

                  <div class="flex flex-col text-right font-['JetBrains_Mono']">
                    <span class="text-sm font-bold text-white">{{ course.enrollmentsThisMonth || 0 }}</span>
                    <span class="text-[10px] text-[#a18d7b]">Enrollments this month</span>
                  </div>

                    <div class="flex flex-col text-right font-['JetBrains_Mono']">
                      <div class="flex items-center justify-end gap-1 text-[#E8931A] text-xs font-bold">
                        <span>{{ course.rating ?? 0 }}</span>
                        <span class="material-symbols-outlined text-sm text-[#E8931A]">star</span>
                      </div>
                      <span class="text-[10px] text-[#a18d7b]">{{ course.reviewCount || 0 }} reviews</span>
                    </div>

                  <div class="flex items-center gap-2 shrink-0">
                    <!-- Edit / Manage Course Action Button -->
                    <a
                      [routerLink]="['/admin/courses', course.id, 'manage']"
                      class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] hover:bg-[#7E22CE] px-4 py-2.5 rounded transition-all shadow"
                    >
                      Edit / manage course
                    </a>
                    <button
                      type="button"
                      (click)="deleteCourse(course)"
                      class="font-['JetBrains_Mono'] text-xs font-bold text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab]/10 px-3 py-2.5 rounded transition-all"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                </div>
              }
            </div>
          } @else {
            <div class="bg-[#121A2B] border border-dashed border-[#378ADD]/50 rounded-lg px-6 py-14 text-center">
              <span class="material-symbols-outlined text-4xl text-[#E8931A] mb-3">school</span>
              <h2 class="font-['Hanken_Grotesk'] text-xl font-bold text-white mb-2">
                {{ publishedCourses().length ? 'No courses match your search' : 'No courses are live yet' }}
              </h2>
              <p class="font-['Inter'] text-sm text-[#a18d7b] max-w-lg mx-auto">
                {{ publishedCourses().length ? 'Try another title or slug.' : 'Create a course or add the JavaScript curriculum to start publishing your catalog.' }}
              </p>
            </div>
          }
        </div>
      }

      <!-- TAB 2: REVENUE ANALYTICS -->
      @if (activeTab() === 'revenue') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div class="bg-[#121A2B] technical-border p-6 rounded">
            <div class="font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Total Revenue</div>
            <div class="font-['JetBrains_Mono'] text-2xl font-bold text-[#E8931A]">
              ₹{{ metrics()?.totalRevenue?.toLocaleString('en-IN') || 0 }}
            </div>
          </div>

          <div class="bg-[#121A2B] technical-border p-6 rounded">
            <div class="font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Active Subscriptions</div>
            <div class="font-['JetBrains_Mono'] text-2xl font-bold text-[#378ADD]">
              {{ metrics()?.activeSubscriptions || 0 }} Users
            </div>
          </div>

          <div class="bg-[#121A2B] technical-border p-6 rounded">
            <div class="font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Churn Rate</div>
            <div class="font-['JetBrains_Mono'] text-2xl font-bold text-[#ffb4ab]">
              {{ metrics()?.churnRate || '0%' }}
            </div>
          </div>

          <div class="bg-[#121A2B] technical-border p-6 rounded">
            <div class="font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Total Students</div>
            <div class="font-['JetBrains_Mono'] text-2xl font-bold text-white">
              {{ metrics()?.totalStudents || 0 }} Registered
            </div>
          </div>
        </div>
      }

      <!-- TAB 3: STUDENTS -->
      @if (activeTab() === 'students') {
        <div class="bg-[#121A2B] technical-border rounded p-6 flex flex-col gap-6">
          <table class="w-full text-left font-['Inter'] text-xs text-[#d9c3af]">
            <thead class="font-['JetBrains_Mono'] text-[11px] uppercase text-[#a18d7b] bg-[#040810]/60 border-b border-[#1E293B]">
              <tr>
                <th class="p-3">Name</th>
                <th class="p-3">Email</th>
                <th class="p-3">Role</th>
                <th class="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E293B]/40">
              @for (student of students(); track student.id) {
                <tr>
                  <td class="p-3 font-semibold text-white">{{ student.name }}</td>
                  <td class="p-3 font-['JetBrains_Mono'] text-[#d9c3af]">{{ student.email }}</td>
                  <td class="p-3 font-['JetBrains_Mono'] text-[#E8931A]">{{ student.role }}</td>
                  <td class="p-3 font-['JetBrains_Mono'] text-[#a18d7b]">{{ student.createdAt | date:'mediumDate' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- TAB 4: COUPONS -->
      @if (activeTab() === 'coupons') {
        <div class="bg-[#121A2B] technical-border rounded p-6">
          <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Active System Coupons</h3>
          <table class="w-full text-left font-['Inter'] text-xs text-[#d9c3af]">
            <thead class="font-['JetBrains_Mono'] text-[11px] uppercase text-[#a18d7b] bg-[#040810]/60 border-b border-[#1E293B]">
              <tr>
                <th class="p-3">Code</th>
                <th class="p-3">Discount</th>
                <th class="p-3">Times Used</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E293B]/40">
              @for (coupon of coupons(); track coupon.id) {
                <tr>
                  <td class="p-3 font-['JetBrains_Mono'] font-bold text-[#E8931A]">{{ coupon.code }}</td>
                  <td class="p-3 font-['JetBrains_Mono'] text-white">₹{{ coupon.discountAmount || 500 }}</td>
                  <td class="p-3 font-['JetBrains_Mono'] text-[#378ADD]">{{ coupon.timesUsed }} / Unlimited</td>
                  <td class="p-3 text-right">
                    <button (click)="deleteCoupon(coupon.id)" class="font-['JetBrains_Mono'] text-[11px] text-[#ffb4ab] hover:underline">Delete</button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private coursesService = inject(CoursesService);
  private router = inject(Router);

  activeTab = signal<'courses' | 'revenue' | 'students' | 'coupons'>('courses');
  metrics = signal<RevenueMetrics | null>(null);
  students = signal<Student[]>([]);
  coupons = signal<Coupon[]>([]);
  publishedCourses = signal<Course[]>([]);

  searchCourseQuery = '';
  sortBy = 'Newest';

  ngOnInit() {
    this.loadCourses();
    this.adminService.getMetrics().subscribe((data) => this.metrics.set(data));
    this.adminService
      .searchStudents('')
      .subscribe((data) => this.students.set(data));
    this.adminService.getCoupons().subscribe((data) => this.coupons.set(data));
  }

  loadCourses() {
    this.coursesService
      .getAllCoursesAdmin()
      .subscribe((data) => this.publishedCourses.set(data));
  }

  filteredCourses(): Course[] {
    const q = this.searchCourseQuery.toLowerCase();
    const filtered = this.publishedCourses().filter(
      (c) =>
        c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
    return [...filtered].sort((a, b) => {
      if (this.sortBy === 'Oldest')
        return this.createdTime(a) - this.createdTime(b);
      if (this.sortBy === 'Popular')
        return (b.enrollmentsThisMonth || 0) - (a.enrollmentsThisMonth || 0);
      return this.createdTime(b) - this.createdTime(a);
    });
  }

  createNewCourse() {
    const newCourse: Course = {
      id: 'course-' + Date.now(),
      slug: 'new-course-' + Date.now(),
      title: 'New Architecture Course (Draft)',
      subtitle: 'Build high-performance software systems.',
      description: 'Comprehensive hands-on architectural masterclass.',
      thumbnail: '/assets/course-agentic-ai.png',
      price: 4999,
      isFree: false,
      currency: 'INR',
      level: 'Advanced',
      status: 'DRAFT',
      isPublished: false,
      earnedThisMonth: 0,
      enrollmentsThisMonth: 0,
      rating: 0,
      modules: [],
    };

    this.coursesService.createCourse(newCourse).subscribe({
      next: (created) => {
        this.router.navigate(['/admin/courses', created.id, 'manage']);
      },
    });
  }

  importJavaScriptCourse() {
    this.coursesService.importJavaScriptCourse().subscribe({
      next: (course) => {
        this.loadCourses();
        this.router.navigate(['/admin/courses', course.id, 'manage']);
      },
      error: () =>
        alert('The JavaScript course could not be created. Please try again.'),
    });
  }

  private createdTime(course: Course): number {
    const createdAt = (course as Course & { createdAt?: string | Date })
      .createdAt;
    return createdAt ? new Date(createdAt).getTime() : 0;
  }

  deleteCoupon(id: string) {
    this.adminService.deleteCoupon(id).subscribe({
      next: () =>
        this.coupons.update((coupons) =>
          coupons.filter((coupon) => coupon.id !== id),
        ),
    });
  }

  deleteCourse(course: Course) {
    if (
      typeof window === 'undefined' ||
      !window.confirm('Are you sure you want to delete?')
    )
      return;

    this.coursesService.deleteCourse(course.id).subscribe({
      next: () => {
        this.publishedCourses.update((courses) =>
          courses.filter((candidate) => candidate.id !== course.id),
        );
        alert('Course deleted successfully.');
      },
      error: () => alert('The course could not be deleted. Please try again.'),
    });
  }
}
