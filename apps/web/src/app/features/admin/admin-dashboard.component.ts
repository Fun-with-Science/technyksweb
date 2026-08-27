import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService, RevenueMetrics, Student, Coupon } from '../../core/services/admin.service';
import { CoursesService, Course } from '../../core/services/courses.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="px-6 md:px-16 pt-24 pb-20 max-w-7xl mx-auto">
      <!-- Admin Header -->
      <div class="mb-8 border-b border-[#1E293B] pb-6 flex justify-between items-center">
        <div>
          <div class="inline-flex items-center gap-2 font-['JetBrains_Mono'] text-xs text-[#E8931A] px-3.5 py-1.5 border border-[#E8931A]/30 bg-[#E8931A]/10 rounded-full w-fit mb-2">
            <span class="material-symbols-outlined text-[16px]">admin_panel_settings</span>
            ADMIN CONSOLE (INSTRUCTOR ONLY)
          </div>
          <h1 class="font-['Hanken_Grotesk'] text-3xl font-bold text-white">Technyks Academy Analytics & Operations</h1>
        </div>
      </div>

      <!-- Metrics Cards Row -->
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

      <!-- Navigation Tabs -->
      <div class="flex gap-4 border-b border-[#1E293B] mb-8 font-['JetBrains_Mono'] text-xs uppercase">
        <button
          (click)="activeTab.set('revenue')"
          [class.border-b-2]="activeTab() === 'revenue'"
          [class.border-[#E8931A]]="activeTab() === 'revenue'"
          [class.text-[#E8931A]]="activeTab() === 'revenue'"
          [class.text-[#d9c3af]]="activeTab() !== 'revenue'"
          class="pb-3 px-2 font-bold transition-colors"
        >
          Revenue & Sales
        </button>

        <button
          (click)="activeTab.set('courses')"
          [class.border-b-2]="activeTab() === 'courses'"
          [class.border-[#E8931A]]="activeTab() === 'courses'"
          [class.text-[#E8931A]]="activeTab() === 'courses'"
          [class.text-[#d9c3af]]="activeTab() !== 'courses'"
          class="pb-3 px-2 font-bold transition-colors"
        >
          Course Creator (Udemy-Style)
        </button>

        <button
          (click)="activeTab.set('students')"
          [class.border-b-2]="activeTab() === 'students'"
          [class.border-[#E8931A]]="activeTab() === 'students'"
          [class.text-[#E8931A]]="activeTab() === 'students'"
          [class.text-[#d9c3af]]="activeTab() !== 'students'"
          class="pb-3 px-2 font-bold transition-colors"
        >
          Student Roster
        </button>

        <button
          (click)="activeTab.set('coupons')"
          [class.border-b-2]="activeTab() === 'coupons'"
          [class.border-[#E8931A]]="activeTab() === 'coupons'"
          [class.text-[#E8931A]]="activeTab() === 'coupons'"
          [class.text-[#d9c3af]]="activeTab() !== 'coupons'"
          class="pb-3 px-2 font-bold transition-colors"
        >
          Coupon Codes
        </button>
      </div>

      <!-- Tab 1: Revenue & Sales Breakdown -->
      @if (activeTab() === 'revenue') {
        <div class="bg-[#121A2B] technical-border rounded p-6">
          <h3 class="font-['Hanken_Grotesk'] text-lg font-bold text-white mb-4">Sales by Course & Plan</h3>
          
          <table class="w-full text-left font-['Inter'] text-xs text-[#d9c3af]">
            <thead class="font-['JetBrains_Mono'] text-[11px] uppercase text-[#a18d7b] bg-[#040810]/60 border-b border-[#1E293B]">
              <tr>
                <th class="p-3">Track / Item Title</th>
                <th class="p-3">Sales Count</th>
                <th class="p-3">Total Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#1E293B]/40">
              @for (sale of metrics()?.salesByCourse; track sale.title) {
                <tr>
                  <td class="p-3 font-semibold text-white">{{ sale.title }}</td>
                  <td class="p-3 font-['JetBrains_Mono'] text-[#378ADD]">{{ sale.count }}</td>
                  <td class="p-3 font-['JetBrains_Mono'] text-[#E8931A] font-bold">₹{{ sale.totalAmount.toLocaleString('en-IN') }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Tab 2: Udemy-Style Course Creator -->
      @if (activeTab() === 'courses') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Course Creator Form -->
          <div class="bg-[#121A2B] technical-border rounded p-6 flex flex-col gap-4">
            <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white flex items-center gap-2">
              <span class="material-symbols-outlined text-[#E8931A]">add_box</span>
              Create New Architecture Track
            </h3>

            <div>
              <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Course Title</label>
              <input
                type="text"
                [(ngModel)]="newCourseTitle"
                placeholder="Advanced DeepSeek V3 Architecture"
                class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['Inter']"
              />
            </div>

            <div>
              <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Subtitle</label>
              <input
                type="text"
                [(ngModel)]="newCourseSubtitle"
                placeholder="Build production AI pipelines..."
                class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['Inter']"
              />
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Price (₹)</label>
                <input
                  type="number"
                  [(ngModel)]="newCoursePrice"
                  placeholder="4999"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                />
              </div>

              <div>
                <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Level</label>
                <select
                  [(ngModel)]="newCourseLevel"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div>
              <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Thumbnail Asset Path / URL</label>
              <input
                type="text"
                [(ngModel)]="newCourseThumbnail"
                placeholder="/assets/agentic-ai.jpg"
                class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
              />
            </div>

            <div class="border-t border-[#1E293B] pt-4 mt-2">
              <span class="block font-['JetBrains_Mono'] text-[11px] text-[#378ADD] uppercase mb-2">// BUNNY STREAM VIDEO LESSON</span>
              
              <div class="flex flex-col gap-3">
                <input
                  type="text"
                  [(ngModel)]="newLessonTitle"
                  placeholder="Lesson 1: System Overview"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['Inter']"
                />

                <input
                  type="text"
                  [(ngModel)]="newBunnyVideoId"
                  placeholder="Bunny Stream Video ID (e.g. demo_video_1)"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                />
              </div>
            </div>

            <button
              (click)="createNewCourse()"
              class="w-full font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#E8931A] py-3 rounded hover:bg-[#E8931A]/90 transition-colors mt-2 flex items-center justify-center gap-2"
            >
              <span class="material-symbols-outlined text-sm">publish</span>
              Publish Course to Catalog
            </button>
          </div>

          <!-- Existing Course Catalog Table -->
          <div class="lg:col-span-2 bg-[#121A2B] technical-border rounded p-6">
            <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Published Architecture Tracks</h3>

            <div class="divide-y divide-[#1E293B]/40">
              @for (course of publishedCourses(); track course.id) {
                <div class="py-4 flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <img [src]="course.thumbnail || '/assets/agentic-ai.jpg'" class="w-16 h-10 object-cover rounded border border-[#1E293B]" />
                    <div>
                      <h4 class="font-['Hanken_Grotesk'] text-sm font-bold text-white">{{ course.title }}</h4>
                      <span class="font-['JetBrains_Mono'] text-[11px] text-[#378ADD]">{{ course.level }} • {{ course.modules?.length || 1 }} Modules</span>
                    </div>
                  </div>

                  <div class="font-['JetBrains_Mono'] text-sm font-bold text-[#E8931A]">
                    ₹{{ course.price.toLocaleString('en-IN') }}
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      }

      <!-- Tab 3: Student Search -->
      @if (activeTab() === 'students') {
        <div class="bg-[#121A2B] technical-border rounded p-6 flex flex-col gap-6">
          <div class="flex gap-4">
            <input
              type="text"
              [(ngModel)]="searchQuery"
              (keyup.enter)="loadStudents()"
              placeholder="Search students by name or email..."
              class="flex-grow bg-[#040810] border border-[#1E293B] focus:border-[#E8931A] focus:outline-none rounded px-4 py-2.5 text-xs text-white font-['Inter']"
            />
            <button
              (click)="loadStudents()"
              class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#E8931A] px-6 py-2.5 rounded hover:bg-[#E8931A]/90 transition-colors"
            >
              Search
            </button>
          </div>

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
                  <td class="p-3 font-['JetBrains_Mono']">
                    <span [class.text-[#E8931A]]="student.role === 'ADMIN'" [class.text-[#378ADD]]="student.role === 'STUDENT'">
                      {{ student.role }}
                    </span>
                  </td>
                  <td class="p-3 font-['JetBrains_Mono'] text-[#a18d7b]">{{ student.createdAt | date:'mediumDate' }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }

      <!-- Tab 4: Coupon Management -->
      @if (activeTab() === 'coupons') {
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- Create Form -->
          <div class="bg-[#121A2B] technical-border rounded p-6 flex flex-col gap-4">
            <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white">Create New Coupon</h3>
            
            <div>
              <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Coupon Code</label>
              <input
                type="text"
                [(ngModel)]="newCouponCode"
                placeholder="PRO2026"
                class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono'] uppercase"
              />
            </div>

            <div>
              <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Discount %</label>
              <input
                type="number"
                [(ngModel)]="newDiscountPercent"
                placeholder="25"
                class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
              />
            </div>

            <div>
              <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Usage Limit</label>
              <input
                type="number"
                [(ngModel)]="newUsageLimit"
                placeholder="100"
                class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
              />
            </div>

            <button
              (click)="createCoupon()"
              class="w-full font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#E8931A] py-3 rounded hover:bg-[#E8931A]/90 transition-colors mt-2"
            >
              Create Coupon
            </button>
          </div>

          <!-- Coupon List -->
          <div class="lg:col-span-2 bg-[#121A2B] technical-border rounded p-6">
            <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Active Coupons</h3>
            
            <table class="w-full text-left font-['Inter'] text-xs text-[#d9c3af]">
              <thead class="font-['JetBrains_Mono'] text-[11px] uppercase text-[#a18d7b] bg-[#040810]/60 border-b border-[#1E293B]">
                <tr>
                  <th class="p-3">Code</th>
                  <th class="p-3">Discount</th>
                  <th class="p-3">Times Used</th>
                  <th class="p-3">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[#1E293B]/40">
                @for (coupon of coupons(); track coupon.id) {
                  <tr>
                    <td class="p-3 font-['JetBrains_Mono'] font-bold text-[#E8931A]">{{ coupon.code }}</td>
                    <td class="p-3 font-['JetBrains_Mono'] text-white">
                      {{ coupon.discountPercent ? coupon.discountPercent + '%' : '₹' + coupon.discountAmount }}
                    </td>
                    <td class="p-3 font-['JetBrains_Mono'] text-[#378ADD]">
                      {{ coupon.timesUsed }} / {{ coupon.usageLimit || '∞' }}
                    </td>
                    <td class="p-3">
                      <button
                        (click)="deleteCoupon(coupon.id)"
                        class="font-['JetBrains_Mono'] text-xs text-[#ffb4ab] hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
    </div>
  `
})
export class AdminDashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  private coursesService = inject(CoursesService);

  activeTab = signal<'revenue' | 'courses' | 'students' | 'coupons'>('revenue');
  metrics = signal<RevenueMetrics | null>(null);
  students = signal<Student[]>([]);
  coupons = signal<Coupon[]>([]);
  publishedCourses = signal<Course[]>([]);

  searchQuery = '';
  newCouponCode = '';
  newDiscountPercent: number | null = null;
  newUsageLimit: number | null = null;

  // New Course Form Fields
  newCourseTitle = '';
  newCourseSubtitle = '';
  newCoursePrice: number | null = 4999;
  newCourseLevel = 'Advanced';
  newCourseThumbnail = '/assets/agentic-ai.jpg';
  newLessonTitle = '';
  newBunnyVideoId = '';

  ngOnInit() {
    this.adminService.getMetrics().subscribe({
      next: (data) => this.metrics.set(data)
    });
    this.loadStudents();
    this.loadCoupons();
    this.loadPublishedCourses();
  }

  loadPublishedCourses() {
    this.coursesService.getCourses().subscribe({
      next: (data) => this.publishedCourses.set(data)
    });
  }

  loadStudents() {
    this.adminService.searchStudents(this.searchQuery).subscribe({
      next: (data) => this.students.set(data)
    });
  }

  loadCoupons() {
    this.adminService.getCoupons().subscribe({
      next: (data) => this.coupons.set(data)
    });
  }

  createNewCourse() {
    if (!this.newCourseTitle) return;

    this.adminService.createCourse({
      title: this.newCourseTitle,
      subtitle: this.newCourseSubtitle || 'Master enterprise software architecture',
      description: this.newCourseSubtitle || 'Comprehensive system design masterclass',
      price: this.newCoursePrice || 4999,
      level: this.newCourseLevel,
      thumbnail: this.newCourseThumbnail,
    }).subscribe({
      next: () => {
        this.newCourseTitle = '';
        this.newCourseSubtitle = '';
        this.loadPublishedCourses();
        alert('Course created & published to catalog!');
      }
    });
  }

  createCoupon() {
    if (!this.newCouponCode) return;
    this.adminService.createCoupon({
      code: this.newCouponCode,
      discountPercent: this.newDiscountPercent,
      usageLimit: this.newUsageLimit,
    }).subscribe({
      next: () => {
        this.newCouponCode = '';
        this.newDiscountPercent = null;
        this.newUsageLimit = null;
        this.loadCoupons();
      }
    });
  }

  deleteCoupon(id: string) {
    this.adminService.deleteCoupon(id).subscribe({
      next: () => this.loadCoupons()
    });
  }
}
