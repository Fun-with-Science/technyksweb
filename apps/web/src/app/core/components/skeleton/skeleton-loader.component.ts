import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (type === 'card') {
      <div class="rounded-xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#121A2B] p-4 flex flex-col gap-4 animate-pulse overflow-hidden shadow-sm">
        <!-- Image Placeholder -->
        <div class="w-full aspect-video rounded-lg bg-slate-200 dark:bg-slate-800"></div>
        <!-- Title & Subtitle -->
        <div class="flex flex-col gap-2">
          <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div class="h-3 w-1/2 rounded bg-slate-200/70 dark:bg-slate-800/70"></div>
        </div>
        <!-- Meta Bar & Price -->
        <div class="mt-4 flex items-center justify-between border-t border-slate-100 dark:border-[#1E293B] pt-3">
          <div class="h-4 w-16 rounded bg-slate-200 dark:bg-slate-800"></div>
          <div class="h-6 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
        </div>
      </div>
    } @else if (type === 'row') {
      <div class="h-16 w-full rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#121A2B] p-4 flex items-center justify-between animate-pulse">
        <div class="flex items-center gap-4">
          <div class="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
          <div class="flex flex-col gap-1.5">
            <div class="h-3.5 w-48 rounded bg-slate-200 dark:bg-slate-800"></div>
            <div class="h-2.5 w-28 rounded bg-slate-200/70 dark:bg-slate-800/70"></div>
          </div>
        </div>
        <div class="h-6 w-20 rounded bg-slate-200 dark:bg-slate-800"></div>
      </div>
    } @else {
      <div [ngClass]="customClass" class="rounded bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
    }
  `
})
export class SkeletonLoaderComponent {
  @Input() type: 'card' | 'row' | 'custom' = 'card';
  @Input() customClass = 'h-4 w-full';
}
