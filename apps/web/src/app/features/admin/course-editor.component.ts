import { Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { CoursesService, Course, Module, Lesson } from '../../core/services/courses.service';
import { AdminService, Coupon } from '../../core/services/admin.service';

@Component({
  selector: 'app-course-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="min-h-screen bg-[#040810] text-[#e0e3e5] pt-16 flex flex-col">
      <!-- Top Header Navigation Bar -->
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
          <a [routerLink]="['/courses', course()?.slug]" target="_blank" class="font-['JetBrains_Mono'] text-xs text-[#378ADD] hover:underline flex items-center gap-1">
            Preview Student View <span class="material-symbols-outlined text-sm">open_in_new</span>
          </a>
          <button (click)="saveAllChanges()" class="font-['JetBrains_Mono'] text-xs font-bold uppercase text-[#040810] bg-[#E8931A] px-5 py-2 rounded hover:bg-[#E8931A]/90 transition-all shadow-lg flex items-center gap-1">
            <span class="material-symbols-outlined text-sm">save</span>
            Save Changes
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

              <button
                (click)="activeTab.set('intended')"
                [class.bg-[#121A2B]]="activeTab() === 'intended'"
                [class.text-[#E8931A]]="activeTab() === 'intended'"
                [class.text-[#d9c3af]]="activeTab() !== 'intended'"
                class="text-left px-4 py-2.5 rounded hover:bg-[#121A2B]/60 transition-all font-medium flex items-center justify-between"
              >
                <span>Intended Learners</span>
                <span class="material-symbols-outlined text-sm">groups</span>
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
          
          <!-- TAB 1: CURRICULUM BUILDER (Screenshot 3) -->
          @if (activeTab() === 'curriculum') {
            <div>
              <div class="flex items-center justify-between border-b border-[#1E293B] pb-6 mb-6">
                <div>
                  <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white">Curriculum</h2>
                  <p class="font-['Inter'] text-xs text-[#d9c3af] mt-1">
                    Create your course in sections, each focused on a single learning objective. Add video lectures, preview toggles, and Bunny Stream IDs.
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
                                <span class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b]">Bunny Video ID:</span>
                                <input
                                  type="text"
                                  [(ngModel)]="lesson.videoAssetRef"
                                  placeholder="e.g. demo_video_1"
                                  class="bg-[#040810] border border-[#1E293B] rounded px-2 py-0.5 text-[10px] text-[#378ADD] font-['JetBrains_Mono']"
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

          <!-- TAB 2: COURSE LANDING PAGE (Screenshot 4) -->
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
                <span class="font-['JetBrains_Mono'] text-[10px] text-[#a18d7b] block mt-1">Your title should be a mix of attention-grabbing, informative, and optimized for search.</span>
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

              <!-- Topics & Category Selection -->
              <div>
                <label class="block font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-2">What is primarily taught in your course?</label>
                <div class="flex flex-wrap gap-2 mb-3">
                  <span class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] px-3.5 py-1.5 rounded-full">Automation</span>
                  <span class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] px-3.5 py-1.5 rounded-full">n8n</span>
                  <span class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] px-3.5 py-1.5 rounded-full">AI Agents & Agentic AI</span>
                </div>

                <label class="block font-['JetBrains_Mono'] text-[11px] text-[#a18d7b] uppercase mb-1">Most representative topic</label>
                <select
                  [ngModel]="course()?.level"
                  (ngModelChange)="updateCourseField('level', $event)"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                >
                  <option value="Advanced">AI Agents & Agentic AI</option>
                  <option value="Intermediate">Architectural Intelligence & Monorepos</option>
                  <option value="Beginner">Full-Stack SaaS Blueprint</option>
                </select>
              </div>

              <!-- Course Image Upload & Preview Card (Screenshot 5) -->
              <div class="border-t border-[#1E293B] pt-6">
                <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Course image</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Image Preview Box -->
                  <div class="relative w-full h-44 bg-[#040810] border border-[#1E293B] rounded-lg overflow-hidden flex items-center justify-center">
                    <img [src]="course()?.thumbnail || '/assets/agentic-ai.jpg'" class="w-full h-full object-cover" />
                  </div>

                  <!-- Upload Controls & Guidelines -->
                  <div class="flex flex-col gap-3 font-['Inter'] text-xs">
                    <p class="text-[#d9c3af]">
                      Upload your course image here. Important guidelines: <span class="font-['JetBrains_Mono'] text-white font-bold">750x422 pixels</span>; .jpg, .jpeg, .gif, or .png. No text on the image.
                    </p>
                    <div class="flex gap-2">
                      <input
                        type="text"
                        [ngModel]="course()?.thumbnail"
                        (ngModelChange)="updateCourseField('thumbnail', $event)"
                        placeholder="/assets/agentic-ai.jpg"
                        class="flex-grow bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                      />
                      <button (click)="saveAllChanges()" class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] hover:bg-[#7E22CE] px-4 py-2 rounded shrink-0">
                        Upload File
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Promotional Video Upload & Player Box (Screenshot 5) -->
              <div class="border-t border-[#1E293B] pt-6">
                <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Promotional video</h3>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <!-- Video Player Box -->
                  <div class="relative w-full h-44 bg-[#040810] border border-[#1E293B] rounded-lg flex flex-col justify-between p-4">
                    <div class="flex-grow flex items-center justify-center">
                      <span class="material-symbols-outlined text-4xl text-white opacity-80">play_circle</span>
                    </div>
                    <div class="flex items-center justify-between text-[#a18d7b] font-['JetBrains_Mono'] text-[10px]">
                      <span>0:00 / 0:00</span>
                      <span class="material-symbols-outlined text-sm">settings</span>
                    </div>
                  </div>

                  <!-- Upload Controls & Guidelines -->
                  <div class="flex flex-col gap-3 font-['Inter'] text-xs">
                    <p class="text-[#d9c3af]">
                      Your promo video is a quick and compelling way for students to preview what they'll learn in your course. Students considering your course are more likely to enroll.
                    </p>
                    <div class="flex gap-2">
                      <input
                        type="text"
                        placeholder="Bunny Stream Promo Video ID (e.g. promo_1)"
                        class="flex-grow bg-[#040810] border border-[#1E293B] rounded px-3 py-2 text-xs text-white font-['JetBrains_Mono']"
                      />
                      <button (click)="saveAllChanges()" class="font-['JetBrains_Mono'] text-xs font-bold text-white bg-[#6B21A8] hover:bg-[#7E22CE] px-4 py-2 rounded shrink-0">
                        Upload File
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Instructor Profile Section (Screenshot 5) -->
              <div class="border-t border-[#1E293B] pt-6 mb-4">
                <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Instructor profile(s)</h3>
                <div class="border border-[#378ADD]/30 bg-[#378ADD]/10 rounded-lg p-4 flex items-center gap-3 text-xs text-[#378ADD] font-['JetBrains_Mono'] mb-4">
                  <span class="material-symbols-outlined text-base">check_circle</span>
                  <span>All instructor bios are complete!</span>
                </div>

                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-[#E8931A] flex items-center justify-center font-bold text-[#040810] font-['Hanken_Grotesk']">
                    TA
                  </div>
                  <span class="font-['Hanken_Grotesk'] text-sm font-bold text-white">Technyks Senior Instructor</span>
                </div>
              </div>
            </div>
          }

          <!-- TAB 3: PROMOTIONS & COUPONS (Screenshot 2) -->
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
                <p class="font-['Inter'] text-xs text-[#d9c3af]">Any time a student uses this link, we will credit you with the direct enrollment sale.</p>
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
                    <p class="font-['Inter'] text-xs text-[#d9c3af]">Create promo codes for your students.</p>
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

              <!-- Coupons Table -->
              <div class="border border-[#1E293B] bg-[#040810]/60 rounded-lg p-6">
                <h3 class="font-['Hanken_Grotesk'] text-base font-bold text-white mb-4">Active & Expired Coupons</h3>
                <table class="w-full text-left font-['Inter'] text-xs text-[#d9c3af]">
                  <thead class="font-['JetBrains_Mono'] text-[11px] uppercase text-[#a18d7b] bg-[#121A2B] border-b border-[#1E293B]">
                    <tr>
                      <th class="p-3">Code</th>
                      <th class="p-3">Discount</th>
                      <th class="p-3">Status</th>
                      <th class="p-3">Redemptions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#1E293B]/40">
                    @for (coupon of coupons(); track coupon.id) {
                      <tr>
                        <td class="p-3 font-['JetBrains_Mono'] font-bold text-[#E8931A]">{{ coupon.code }}</td>
                        <td class="p-3 font-['JetBrains_Mono'] text-white">₹{{ coupon.discountAmount || 500 }}</td>
                        <td class="p-3 font-['JetBrains_Mono'] text-[#378ADD]">ACTIVE</td>
                        <td class="p-3 font-['JetBrains_Mono'] text-[#a18d7b]">{{ coupon.timesUsed }} / Unlimited</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- TAB 4: PRICING -->
          @if (activeTab() === 'pricing') {
            <div class="flex flex-col gap-6 max-w-lg">
              <div class="border-b border-[#1E293B] pb-4">
                <h2 class="font-['Hanken_Grotesk'] text-2xl font-bold text-white">Pricing & Tier</h2>
                <p class="font-['Inter'] text-xs text-[#d9c3af] mt-1">Set the standalone price for your course in INR (₹).</p>
              </div>

              <div>
                <label class="block font-['JetBrains_Mono'] text-xs text-[#a18d7b] uppercase mb-1">Course Price (₹ INR)</label>
                <input
                  type="number"
                  [ngModel]="course()?.price"
                  (ngModelChange)="updateCourseField('price', $event)"
                  class="w-full bg-[#040810] border border-[#1E293B] rounded px-4 py-2.5 text-sm text-[#E8931A] font-['JetBrains_Mono'] font-bold"
                />
              </div>
            </div>
          }
        </main>
      </div>
    </div>
  `
})
export class CourseEditorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private coursesService = inject(CoursesService);
  private adminService = inject(AdminService);

  course = signal<Course | null>(null);
  modules = signal<Module[]>([]);
  coupons = signal<Coupon[]>([]);
  activeTab = signal<'curriculum' | 'landing' | 'intended' | 'pricing' | 'promotions'>('curriculum');

  referralUrl = '';
  copiedLink = false;
  showCouponForm = false;

  newCouponCode = '';
  newCouponDiscount: number | null = 479;

  ngOnInit() {
    const courseId = this.route.snapshot.paramMap.get('id');
    if (courseId) {
      this.coursesService.getCourseById(courseId).subscribe({
        next: (c) => {
          this.course.set(c);
          this.modules.set(c.modules || []);
          this.referralUrl = `https://technyks.com/courses/${c.slug}?referralCode=3BDC`;
        }
      });
    }

    this.adminService.getCoupons().subscribe({
      next: (data) => this.coupons.set(data)
    });
  }

  updateCourseField(field: keyof Course, value: any) {
    const current = this.course();
    if (!current) return;
    this.course.set({ ...current, [field]: value });
  }

  addSection() {
    const current = this.modules();
    const newMod: Module = {
      id: 'mod-' + Date.now(),
      title: `Section ${current.length + 1}: New Curriculum Section`,
      order: current.length + 1,
      lessons: [
        {
          id: 'les-' + Date.now(),
          title: 'Lecture 1: Welcome & Overview',
          duration: 900,
          order: 1,
          isFreePreview: true,
          videoAssetRef: 'demo_video_1'
        }
      ]
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
      videoAssetRef: 'demo_video_new'
    };
    target.lessons.push(newLesson);
    this.modules.set([...current]);
  }

  deleteLesson(sIdx: number, lIdx: number) {
    const current = this.modules();
    current[sIdx].lessons.splice(lIdx, 1);
    this.modules.set([...current]);
  }

  copyReferralLink() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(this.referralUrl);
      this.copiedLink = true;
      setTimeout(() => this.copiedLink = false, 2000);
    }
  }

  createCoupon() {
    if (!this.newCouponCode) return;
    this.adminService.createCoupon({
      code: this.newCouponCode,
      discountAmount: this.newCouponDiscount || 479,
    }).subscribe({
      next: () => {
        this.showCouponForm = false;
        this.newCouponCode = '';
        this.adminService.getCoupons().subscribe(data => this.coupons.set(data));
      }
    });
  }

  saveAllChanges() {
    const current = this.course();
    if (!current) return;

    const updated: Course = {
      ...current,
      modules: this.modules()
    };

    this.coursesService.saveCourse(updated).subscribe({
      next: () => {
        alert('Course & Curriculum saved successfully!');
      }
    });
  }
}
