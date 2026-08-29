import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import {
  CoursesService,
  Course,
  Module,
  Lesson,
} from '../../core/services/courses.service';
import { AdminService, Coupon } from '../../core/services/admin.service';

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#040810] text-[#e0e3e5] pt-16 flex flex-col">
      <!-- Top Header Navigation & Status Bar -->
      <div class="bg-[#121A2B] border-b border-[#1E293B] px-6 py-4 flex items-center justify-between sticky top-16 z-30 shadow-md">
        <div class="flex items-center gap-4">
          <a routerLink="/admin" class="text-[#a18d7b] hover:text-white flex items-center gap-1 font-['JetBrains_Mono'] text-xs">
            <span class="material-symbols-outlined text-sm">arrow_back</span>
            Back to Courses
          </a>
          <span class="text-[#1E293B]">|</span>
          <h1 class="font-['Hanken_Grotesk'] text-lg font-bold text-white truncate max-w-md">
            {{ course()?.title || 'Loading Course...' }}
          </h1>
          <span
            [class.bg-[#378ADD]/20]="course()?.status === 'LIVE'"
            [class.text-[#378ADD]]="course()?.status === 'LIVE'"
            [class.bg-[#E8931A]/20]="course()?.status === 'DRAFT'"
            [class.text-[#E8931A]]="course()?.status === 'DRAFT'"
            class="font-['JetBrains_Mono'] text-[10px] uppercase font-bold px-2.5 py-0.5 rounded border border-current"
          >
            {{ course()?.status || 'DRAFT' }}
          </span>
        </div>

        <div class="flex items-center gap-3">
          <!-- LIVE / DRAFT Status Toggle Button -->
          <button
            (click)="togglePublishStatus()"
            [class.bg-[#378ADD]]="course()?.status === 'LIVE'"
            [class.bg-[#E8931A]]="course()?.status !== 'LIVE'"
            class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] px-4 py-2 rounded transition-all shadow flex items-center gap-1.5"
          >
            <span class="material-symbols-outlined text-sm">
              {{ course()?.status === 'LIVE' ? 'public' : 'lock' }}
            </span>
            {{ course()?.status === 'LIVE' ? 'Course is LIVE (Public)' : 'Make Course LIVE (Public)' }}
          </button>

          <a [routerLink]="['/courses', course()?.slug]" target="_blank" class="font-['JetBrains_Mono'] text-xs text-[#378ADD] hover:underline flex items-center gap-1">
            Preview Student View <span class="material-symbols-outlined text-sm">open_in_new</span>
          </a>

          <button (click)="saveAllChanges()" class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-white bg-[#6B21A8] hover:bg-[#7E22CE] px-5 py-2 rounded transition-all shadow-lg flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">save</span>
            Save Changes
          </button>

          <button
            type="button"
            (click)="deleteCurrentCourse()"
            class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#ffb4ab] border border-[#ffb4ab]/40 hover:bg-[#ffb4ab]/10 px-4 py-2 rounded transition-all"
          >
            Delete Course
          </button>
        </div>
      </div>

      <!-- Main Udemy Studio Layout (Left Sidebar + Content Area) -->
      <div class="flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 md:px-8 py-8 gap-8">
        
        <!-- Left Udemy Navigation Sidebar -->
        <aside class="w-full md:w-64 shrink-0 flex flex-col gap-6 font-['Inter'] text-xs">
          <div>
            <div class="font-['JetBrains_Mono'] text-[11px] font-bold text-[#a18d7b] uppercase tracking-wider mb-2">Course Editing</div>
            <nav class="flex flex-col gap-1">
              <button
                (click)="activeTab.set('curriculum')"
                [class.bg-[#121A2B]]="activeTab() === 'curriculum'"
                [class.text-[#E8931A]]="activeTab() === 'curriculum'"
                [class.border-l-4]="activeTab() === 'curriculum'"
                [class.border-[#E8931A]]="activeTab() === 'curriculum'"
                [class.text-[#d9c3af]]="activeTab() !== 'curriculum'"
                class="text-left px-4 py-2.5 rounded hover:bg-[#121A2B]/60 transition-all font-medium flex items-center justify-between"
              >
                <span>Curriculum</span>
                <span class="material-symbols-outlined text-sm">menu_book</span>
              </button>

              <button
                (click)="activeTab.set('landing')"
                [class.bg-[#121A2B]]="activeTab() === 'landing'"
                [class.text-[#E8931A]]="activeTab() === 'landing'"
                [class.border-l-4]="activeTab() === 'landing'"
                [class.border-[#E8931A]]="activeTab() === 'landing'"
                [class.text-[#d9c3af]]="activeTab() !== 'landing'"
                class="text-left px-4 py-2.5 rounded hover:bg-[#121A2B]/60 transition-all font-medium flex items-center justify-between"
              >
                <span>Course Landing Page</span>
                <span class="material-symbols-outlined text-sm">article</span>
              </button>
            </nav>
          </div>

          <div class="border-t border-[#1E293B] pt-4">
            <div class="font-['JetBrains_Mono'] text-[11px] font-bold text-[#a18d7b] uppercase tracking-wider mb-2">Course Management</div>
            <nav class="flex flex-col gap-1">
              <button
                (click)="activeTab.set('pricing')"
                [class.bg-[#121A2B]]="activeTab() === 'pricing'"
                [class.text-[#E8931A]]="activeTab() === 'pricing'"
                [class.text-[#d9c3af]]="activeTab() !== 'pricing'"
                class="text-left px-4 py-2.5 rounded hover:bg-[#121A2B]/60 transition-all font-medium flex items-center justify-between"
              >
                <span>Pricing</span>
                <span class="material-symbols-outlined text-sm">payments</span>
              </button>

              <button
                (click)="activeTab.set('promotions')"
                [class.bg-[#121A2B]]="activeTab() === 'promotions'"
                [class.text-[#E8931A]]="activeTab() === 'promotions'"
                [class.border-l-4]="activeTab() === 'promotions'"
                [class.border-[#E8931A]]="activeTab() === 'promotions'"
                [class.text-[#d9c3af]]="activeTab() !== 'promotions'"
                class="text-left px-4 py-2.5 rounded hover:bg-[#121A2B]/60 transition-all font-medium flex items-center justify-between"
              >
                <span>Promotions & Coupons</span>
                <span class="material-symbols-outlined text-sm">confirmation_number</span>
              </button>
            </nav>
          </div>
        </aside>

        <!-- Right Main Studio Content Area -->
        <main class="flex-grow bg-[#121A2B] technical-border rounded-lg p-6 md:p-8 min-h-[650px]">
          
          <!-- TAB 1: CURRICULUM BUILDER -->
          @if (activeTab() === 'curriculum') {
            <div>
              <div class="flex items-center justify-between border-b border-[#1E293B] pb-6 mb-6">
                <div>
                  <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white">Curriculum</h2>
                  <p class="font-['Inter'] text-xs text-[#d9c3af] mt-1">
                    Create your course in sections, each focused on a single learning objective. Add video lectures and preview toggles, then attach a Bunny ID or a protected YouTube reference for each lesson.
                  </p>
                </div>
                <button (click)="addSection()" class="font-['JetBrains_Mono'] text-xs text-[#378ADD] border border-[#378ADD]/40 hover:bg-[#378ADD]/10 px-4 py-2 rounded flex items-center gap-1">
                  <span class="material-symbols-outlined text-sm">add</span> Add Section
                </button>
              </div>

              <!-- Sections List Accordion -->
              <div class="flex flex-col gap-6">
                @for (module of modules(); track module.id; let sIdx = $index) {
                  <div class="border border-[#1E293B] bg-[#040810]/50 rounded-lg p-5">
                    <div class="flex items-center justify-between mb-4 border-b border-[#1E293B]/60 pb-3">
                      <div class="flex items-center gap-3 flex-grow max-w-xl">
                        <span class="font-['JetBrains_Mono'] text-xs font-bold text-[#E8931A]">Section {{ sIdx + 1 }}:</span>
                        <input
                          type="text"
                          [(ngModel)]="module.title"
                          placeholder="Section Title..."
                          class="bg-[#121A2B] border border-[#1E293B] focus:border-[#E8931A] focus:outline-none rounded px-3 py-1.5 text-xs text-white font-['Hanken_Grotesk'] font-bold flex-grow"
                        />
                      </div>
                      <button (click)="deleteSection(sIdx)" class="text-[#ffb4ab] hover:underline font-['JetBrains_Mono'] text-xs">
                        Remove Section
                      </button>
                    </div>

                    <!-- Lectures List inside Section -->
                    <div class="flex flex-col gap-3 pl-4 border-l-2 border-[#1E293B]">
                      @for (lesson of module.lessons; track lesson.id; let lIdx = $index) {
                        <div class="bg-[#121A2B] border border-[#1E293B] rounded p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                          <div class="flex items-center gap-3 flex-grow w-full md:w-auto">
                            <span class="material-symbols-outlined text-[#378ADD] text-base">play_circle</span>
                            <div class="flex flex-col flex-grow">
                              <input
                                type="text"
                                [(ngModel)]="lesson.title"
                                placeholder="Lecture Title..."
                                class="bg-[#040810] border border-[#1E293B] rounded px-2.5 py-1 text-xs text-white font-['Inter'] font-semibold"
                              />
                              <div class="flex items-center gap-2 mt-1">
                                <span class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b]">Video source reference (optional):</span>
                                <input
                                  type="text"
                                  [(ngModel)]="lesson.videoAssetRef"
                                  placeholder="youtube:VIDEO_ID or Bunny video ID"
                                  class="bg-[#040810] border border-[#1E293B] rounded px-2 py-0.5 text-[10px] text-[#378ADD] font-['JetBrains_Mono']"
                                />
                                <span class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b] ml-1">Minutes:</span>
                                <input
                                  type="number"
                                  min="0"
                                  [ngModel]="Math.round(lesson.duration / 60)"
                                  (ngModelChange)="updateLessonDuration(sIdx, lIdx, $event)"
                                  class="w-16 bg-[#040810] border border-[#1E293B] rounded px-2 py-0.5 text-[10px] text-white font-['JetBrains_Mono']"
                                />
                              </div>
                            </div>
                          </div>

                          <div class="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                            <label class="inline-flex items-center gap-1.5 cursor-pointer font-['JetBrains_Mono'] text-[11px] text-[#d9c3af]">
                              <input
                                type="checkbox"
                                [(ngModel)]="lesson.isFreePreview"
                                class="rounded bg-[#040810] border-[#1E293B] text-[#E8931A] focus:ring-0"
                              />
                              <span>(Preview enabled)</span>
                            </label>

                            <button (click)="deleteLesson(sIdx, lIdx)" class="text-[#ffb4ab] hover:underline font-['JetBrains_Mono'] text-[11px]">
                              Delete
                            </button>
                          </div>
                        </div>
                      }

                      <!-- Add Lecture Button -->
                      <button (click)="addLesson(sIdx)" class="w-fit font-['JetBrains_Mono'] text-xs text-[#E8931A] hover:underline flex items-center gap-1 mt-2">
                        <span class="material-symbols-outlined text-sm">add_circle</span> + Curriculum Item (Lecture)
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB 2: COURSE LANDING PAGE -->
          @if (activeTab() === 'landing') {
            <div class="flex flex-col gap-6 max-w-3xl">
              <div class="border-b border-[#1E293B] pb-4">
                <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white">Course landing page</h2>
                <p class="font-['Inter'] text-xs text-[#d9c3af] mt-1">
                  Your course landing page is crucial to your success. Make it compelling to demonstrate why someone would want to enroll in your course.
                </p>
              </div>

              <div>
                <label class="block font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Course title</label>
                <input
                  type="text"
                  [ngModel]="course()?.title"
                  (ngModelChange)="updateCourseField('title', $event)"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-4 py-2.5 text-xs text-white font-['Hanken_Grotesk'] font-bold"
                />
              </div>

              <div>
                <label class="block font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Course subtitle</label>
                <input
                  type="text"
                  [ngModel]="course()?.subtitle"
                  (ngModelChange)="updateCourseField('subtitle', $event)"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-4 py-2.5 text-xs text-white font-['Inter']"
                />
              </div>

              <div>
                <label class="block font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Course description</label>
                <textarea
                  rows="6"
                  [ngModel]="course()?.description"
                  (ngModelChange)="updateCourseField('description', $event)"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded p-4 text-xs text-white font-['Inter'] leading-relaxed"
                ></textarea>
              </div>

              <!-- Course Image Upload & Preview Card -->
              <div class="border-t border-[#1E293B] pt-6">
                <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Course image</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="relative w-full h-44 bg-[#040810] border border-[#1E293B] rounded-lg overflow-hidden flex items-center justify-center">
                    <img [src]="course()?.thumbnail || '/assets/agentic-ai.jpg'" class="w-full h-full object-cover" />
                  </div>

                  <div class="flex flex-col gap-3 font-['Inter'] text-xs">
                    <p class="text-[#d9c3af]">
                      Upload your course image here. Important guidelines: <span class="font-['JetBrains_Mono'] text-white font-bold">750x422 pixels</span>; .jpg, .jpeg, .gif, or .png. No text on the image.
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <input
                        type="text"
                        [ngModel]="course()?.thumbnail"
                        (ngModelChange)="updateCourseField('thumbnail', $event)"
                        placeholder="Paste an image URL or choose a file"
                        class="flex-grow bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                      />
                      <label class="font-['JetBrains_Mono'] text-xs font-bold text-[#040810] bg-[#E8931A] hover:bg-[#f6a52a] px-4 py-2 rounded shrink-0 cursor-pointer">
                        Choose image
                        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" class="hidden" (change)="handleThumbnailFile($event)" />
                      </label>
                      <button type="button" (click)="saveAllChanges()" class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] hover:bg-[#7E22CE] px-4 py-2 rounded shrink-0">
                        Save image
                      </button>
                    </div>
                    <span class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b]">Images are read by your browser and saved with the course record. Maximum file size: 4 MB.</span>
                  </div>
                </div>
              </div>

              <!-- Promotional Video Upload & Player Box -->
              <div class="border-t border-[#1E293B] pt-6">
                <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Promotional video</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="relative w-full h-44 bg-[#040810] border border-[#1E293B] rounded-lg flex flex-col justify-between p-4">
                    <div class="flex-grow flex items-center justify-center">
                      @if (course()?.promoVideoUrl?.startsWith('data:video/')) {
                        <video [src]="course()?.promoVideoUrl" controls class="w-full h-full object-contain rounded"></video>
                      } @else {
                        <span class="material-symbols-outlined text-4xl text-white opacity-80">play_circle</span>
                      }
                    </div>
                    <div class="flex items-center justify-between text-[#a18d7b] font-['JetBrains_Mono'] text-[10px]">
                      <span>{{ course()?.promoVideoUrl ? 'Promo video configured' : 'No promo video configured' }}</span>
                      <span class="material-symbols-outlined text-sm">settings</span>
                    </div>
                  </div>

                  <div class="flex flex-col gap-3 font-['Inter'] text-xs">
                    <p class="text-[#d9c3af]">
                      Your promo video is a quick and compelling way for students to preview what they'll learn in your course.
                    </p>
                    <div class="flex flex-wrap gap-2">
                      <input
                        type="text"
                        [ngModel]="course()?.promoVideoUrl"
                        (ngModelChange)="updateCourseField('promoVideoUrl', $event)"
                        placeholder="Paste YouTube, Vimeo, or direct video URL"
                        class="flex-grow bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                      />
                      <label class="font-['JetBrains_Mono'] text-xs font-bold text-[#040810] bg-[#E8931A] hover:bg-[#f6a52a] px-4 py-2 rounded shrink-0 cursor-pointer">
                        Upload intro
                        <input type="file" accept="video/mp4,video/webm,video/ogg" class="hidden" (change)="handlePromoVideoFile($event)" />
                      </label>
                      <button type="button" (click)="saveAllChanges()" class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] hover:bg-[#7E22CE] px-4 py-2 rounded shrink-0">
                        Save video
                      </button>
                    </div>
                    <span class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b]">Short intro files up to 8 MB can be stored with the course. Larger lessons should use Bunny Stream.</span>
                  </div>
                </div>
              </div>

              <!-- Student Reviews -->
              <div class="border-t border-[#1E293B] pt-6">
                <div class="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white">Student reviews</h3>
                    <p class="font-['Inter'] text-xs text-[#a18d7b] mt-1">Real reviews from enrolled students appear here automatically.</p>
                  </div>
                  <span class="font-['JetBrains_Mono'] text-xs text-[#E8931A]">{{ course()?.reviewCount || 0 }} reviews</span>
                </div>
                @if (course()?.reviews?.length) {
                  <div class="flex flex-col gap-3">
                    @for (review of course()?.reviews; track review.id) {
                      <article class="border border-[#1E293B] bg-[#040810]/60 rounded-lg p-4">
                        <div class="flex items-center justify-between gap-4 mb-2">
                          <span class="font-['Hanken_Grotesk'] text-sm font-bold text-white">{{ review.user.name }}</span>
                          <span class="font-['JetBrains_Mono'] text-sm text-[#E8931A]">{{ '★'.repeat(review.rating) }}{{ '☆'.repeat(5 - review.rating) }}</span>
                        </div>
                        <p class="font-['Inter'] text-xs text-[#d9c3af] leading-relaxed">{{ review.comment }}</p>
                      </article>
                    }
                  </div>
                } @else {
                  <div class="border border-dashed border-[#1E293B] rounded-lg p-5 font-['Inter'] text-xs text-[#a18d7b]">No student reviews yet.</div>
                }
              </div>
            </div>
          }

          <!-- TAB 3: PROMOTIONS & COUPONS -->
          @if (activeTab() === 'promotions') {
            <div class="flex flex-col gap-6">
              <div class="border-b border-[#1E293B] pb-4">
                <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white">Promotions</h2>
                <p class="font-['Inter'] text-xs text-[#d9c3af] mt-1">
                  Create targeted coupons and referral links to promote your course and increase student enrollments.
                </p>
              </div>

              <!-- Refer Students Card -->
              <div class="border border-[#1E293B] bg-[#040810]/60 rounded-lg p-6 flex flex-col gap-3">
                <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white">Refer students</h3>
                <div class="flex gap-3 max-w-xl">
                  <input
                    type="text"
                    readonly
                    [value]="referralUrl"
                    class="bg-[#121A2B] border border-[#1E293B] rounded px-3 py-2 text-xs text-[#378ADD] font-['JetBrains_Mono'] flex-grow"
                  />
                  <button (click)="copyReferralLink()" class="font-['JetBrains_Mono'] text-xs font-bold text-[#040810] bg-[#E8931A] px-5 py-2 rounded hover:bg-[#E8931A]/90 transition-colors">
                    {{ copiedLink ? 'Copied!' : 'Copy' }}
                  </button>
                </div>
              </div>

              <!-- Create Coupon Section -->
              <div class="border border-[#1E293B] bg-[#040810]/60 rounded-lg p-6 flex flex-col gap-4">
                <div class="flex justify-between items-center">
                  <div>
                    <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white">Monthly Coupons</h3>
                  </div>
                  <button (click)="showCouponForm = !showCouponForm" class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#378ADD] px-4 py-2 rounded hover:bg-[#378ADD]/90 transition-colors">
                    Create Coupon
                  </button>
                </div>

                @if (showCouponForm) {
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-[#1E293B] pt-4 mt-2">
                    <input
                      type="text"
                      [(ngModel)]="newCouponCode"
                      placeholder="COUPON CODE (e.g. VIBE95)"
                      class="bg-[#121A2B] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono'] uppercase"
                    />
                    <input
                      type="number"
                      [(ngModel)]="newCouponDiscount"
                      placeholder="Discount Amount (₹)"
                      class="bg-[#121A2B] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                    />
                    <button (click)="createCoupon()" class="font-['JetBrains_Mono'] text-xs font-bold text-[#040810] bg-[#E8931A] py-2 rounded">
                      Save & Activate
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          <!-- TAB 4: PRICING -->
          @if (activeTab() === 'pricing') {
            <div class="flex flex-col gap-6 max-w-lg">
              <div class="border-b border-[#1E293B] pb-4">
                <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white">Pricing & Tier</h2>
                <p class="font-['Inter'] text-xs text-[#d9c3af] mt-1">Choose whether students pay once or access this course for free after signing in.</p>
              </div>

              <label class="flex items-start gap-3 border border-[#1E293B] bg-[#040810]/60 rounded-lg p-4 cursor-pointer">
                <input
                  type="checkbox"
                  [checked]="course()?.isFree"
                  (change)="toggleFreeCourse($event)"
                  class="mt-0.5 rounded bg-[#040810] border-[#1E293B] text-[#E8931A] focus:ring-0"
                />
                <span>
                  <span class="block font-['Hanken_Grotesk'] text-sm font-bold text-white">Make this a free course</span>
                  <span class="block font-['Inter'] text-xs text-[#a18d7b] mt-1">Logged-in students can enroll directly. The course will not open a payment checkout.</span>
                </span>
              </label>

              @if (!course()?.isFree) {
                <div>
                <label class="block font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Course Price (₹ INR)</label>
                <input
                  type="number"
                  [ngModel]="course()?.price"
                  (ngModelChange)="updateCourseField('price', $event)"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-4 py-2.5 text-sm text-[#E8931A] font-['JetBrains_Mono'] font-bold"
                />
                </div>
              } @else {
                <div class="border border-[#E8931A]/40 bg-[#E8931A]/10 rounded-lg p-4 font-['JetBrains_Mono'] text-xs text-[#E8931A]">
                  This course is free. Its price will be saved as ₹0.
                </div>
              }
            </div>
          }
        </main>
      </div>
    </div>
  `,
})
export class CourseEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private adminService = inject(AdminService);

  course = signal<Course | null>(null);
  modules = signal<Module[]>([]);
  coupons = signal<Coupon[]>([]);
  activeTab = signal<
    'curriculum' | 'landing' | 'intended' | 'pricing' | 'promotions'
  >('curriculum');

  referralUrl = '';
  copiedLink = false;
  showCouponForm = false;

  newCouponCode = '';
  newCouponDiscount: number | null = 479;
  Math = Math;

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.coursesService.getCourseById(courseId).subscribe({
        next: (c) => {
          this.course.set(c);
          this.modules.set(c.modules || []);
          this.referralUrl = `https://technyks.com/courses/${c.slug}?referralCode=3BDC`;
        },
      });
    }

    this.adminService.getCoupons().subscribe({
      next: (data) => this.coupons.set(data),
    });
  }

  togglePublishStatus() {
    const current = this.course();
    if (!current) return;
    const newStatus = current.status === 'LIVE' ? 'DRAFT' : 'LIVE';
    const updated: Course = {
      ...current,
      status: newStatus,
      isPublished: newStatus === 'LIVE',
    };
    this.course.set(updated);
    this.coursesService.saveCourse(updated).subscribe({
      next: () => {
        alert(
          `Course is now ${newStatus === 'LIVE' ? 'LIVE (Public)' : 'DRAFT (Private)'}! Changes saved.`,
        );
      },
    });
  }

  updateCourseField(field: keyof Course, value: any) {
    const current = this.course();
    if (!current) return;
    this.course.set({ ...current, [field]: value });
  }

  toggleFreeCourse(event: Event) {
    const isFree = (event.target as HTMLInputElement).checked;
    this.updateCourseField('isFree', isFree);
    if (isFree) this.updateCourseField('price', 0);
  }

  handleThumbnailFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Please choose an image file.');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Please choose an image smaller than 4 MB.');
      return;
    }
    this.readFileAsDataUrl(file).then((dataUrl) =>
      this.updateCourseField('thumbnail', dataUrl),
    );
  }

  handlePromoVideoFile(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please choose a video file.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('Please choose a short intro video smaller than 8 MB.');
      return;
    }
    this.readFileAsDataUrl(file).then((dataUrl) =>
      this.updateCourseField('promoVideoUrl', dataUrl),
    );
  }

  private readFileAsDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  addSection() {
    const current = this.modules();
    const newMod: Module = {
      id: 'mod-' + Date.now(),
      title: `Section ${current.length + 1}: New Curriculum Section`,
      order: current.length + 1,
      lessons: [],
    };
    this.modules.set([...current, newMod]);
  }

  deleteSection(sIdx: number) {
    const current = this.modules();
    current.splice(sIdx, 1);
    this.modules.set([...current]);
  }

  addLesson(sIdx: number) {
    const current = this.modules();
    const target = current[sIdx];
    const newLesson: Lesson = {
      id: 'les-' + Date.now(),
      title: `Lecture ${target.lessons.length + 1}: New Topic`,
      duration: 600,
      order: target.lessons.length + 1,
      isFreePreview: false,
      videoAssetRef: '',
    };
    target.lessons.push(newLesson);
    this.modules.set([...current]);
  }

  deleteLesson(sIdx: number, lIdx: number) {
    const current = this.modules();
    current[sIdx].lessons.splice(lIdx, 1);
    this.modules.set([...current]);
  }

  updateLessonDuration(sIdx: number, lIdx: number, minutes: number) {
    const current = this.modules();
    const lesson = current[sIdx]?.lessons[lIdx];
    if (!lesson) return;
    lesson.duration = Math.max(0, Math.round(Number(minutes) || 0) * 60);
    this.modules.set([...current]);
  }

  copyReferralLink() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(this.referralUrl);
      this.copiedLink = true;
      setTimeout(() => (this.copiedLink = false), 2000);
    }
  }

  createCoupon() {
    if (!this.newCouponCode) return;
    this.adminService
      .createCoupon({
        code: this.newCouponCode,
        discountAmount: this.newCouponDiscount || 479,
      })
      .subscribe({
        next: () => {
          this.showCouponForm = false;
          this.newCouponCode = '';
          this.adminService
            .getCoupons()
            .subscribe((data) => this.coupons.set(data));
        },
      });
  }

  saveAllChanges() {
    const current = this.course();
    if (!current) return;

    const updated: Course = {
      ...current,
      modules: this.modules(),
      isPublished: current.status === 'LIVE',
    };

    this.coursesService.saveCourse(updated).subscribe({
      next: () => {
        alert('Course & Curriculum saved successfully!');
      },
    });
  }

  deleteCurrentCourse() {
    const current = this.course();
    if (
      !current ||
      typeof window === 'undefined' ||
      !window.confirm('Are you sure you want to delete?')
    )
      return;

    this.coursesService.deleteCourse(current.id).subscribe({
      next: () => {
        alert('Course deleted successfully.');
        this.router.navigate(['/admin']);
      },
      error: () => alert('The course could not be deleted. Please try again.'),
    });
  }
}
