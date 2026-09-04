import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SiteSettingsService } from '../../services/site-settings.service';

@Component({
  selector: 'app-announcement-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (isVisible()) {
      <aside
        class="announcement-bar relative z-50 min-h-10 text-xs px-3 sm:px-4 py-2 flex items-center justify-between transition-all duration-300 shadow-sm border-b"
        [ngClass]="getThemeClasses()"
        aria-label="Site announcement"
      >
        <div class="min-w-0 flex-1 flex items-center justify-center gap-x-2 gap-y-1.5 text-center pl-1 pr-7 sm:px-4 flex-wrap">
          @if (announcement().badgeText) {
            <span
              class="font-['JetBrains_Mono'] text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full shadow-sm"
              [ngClass]="getBadgeClasses()"
            >
              {{ announcement().badgeText }}
            </span>
          }

          <span class="announcement-message max-w-full font-['Inter'] font-semibold tracking-wide text-[11px] sm:text-xs leading-4">
            {{ announcement().message }}
          </span>

          @if (announcement().buttonText && announcement().buttonUrl) {
            @if (isInternalLink(announcement().buttonUrl)) {
              <a
                [routerLink]="announcement().buttonUrl"
                class="font-['JetBrains_Mono'] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-md transition-all shadow-sm inline-flex items-center gap-1 hover:scale-[1.02]"
                [ngClass]="getButtonClasses()"
              >
                {{ announcement().buttonText }}
                <span class="material-symbols-outlined text-[14px]">arrow_forward</span>
              </a>
            } @else {
              <a
                [href]="announcement().buttonUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="font-['JetBrains_Mono'] text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2.5 sm:px-3 py-1 rounded-md transition-all shadow-sm inline-flex items-center gap-1 hover:scale-[1.02]"
                [ngClass]="getButtonClasses()"
              >
                {{ announcement().buttonText }}
                <span class="material-symbols-outlined text-[14px]">open_in_new</span>
              </a>
            }
          }
        </div>

        <button
          type="button"
          (click)="dismiss()"
          aria-label="Close announcement"
          class="absolute right-2 top-1/2 -translate-y-1/2 shrink-0 p-1 rounded-full opacity-80 hover:opacity-100 transition-opacity hover:bg-black/10 dark:hover:bg-white/10"
        >
          <span class="material-symbols-outlined text-[16px] leading-none">close</span>
        </button>
      </aside>
    }
  `,
})
export class AnnouncementBarComponent {
  private siteSettingsService = inject(SiteSettingsService);

  announcement = computed(() => this.siteSettingsService.settings().announcementBar);
  isVisible = computed(() => {
    const bar = this.announcement();
    return bar && bar.enabled && !this.siteSettingsService.isDismissed();
  });

  dismiss() {
    this.siteSettingsService.dismissAnnouncement();
  }

  isInternalLink(url: string): boolean {
    return url.startsWith('/') || url.startsWith('#');
  }

  getThemeClasses(): string {
    const theme = this.announcement()?.theme || 'blue';
    switch (theme) {
      case 'amber':
        return 'bg-amber-500 text-slate-950 border-amber-600';
      case 'emerald':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'purple':
        return 'bg-purple-600 text-white border-purple-700';
      case 'blue':
      default:
        return 'bg-[#1D4ED8] text-white border-blue-700';
    }
  }

  getBadgeClasses(): string {
    const theme = this.announcement()?.theme || 'blue';
    switch (theme) {
      case 'amber':
        return 'bg-slate-950 text-amber-400';
      case 'emerald':
        return 'bg-white text-emerald-800';
      case 'purple':
        return 'bg-white text-purple-800';
      case 'blue':
      default:
        return 'bg-white text-blue-800';
    }
  }

  getButtonClasses(): string {
    const theme = this.announcement()?.theme || 'blue';
    switch (theme) {
      case 'amber':
        return 'bg-slate-950 text-amber-400 hover:bg-slate-900 !text-white';
      case 'emerald':
        return 'bg-white text-emerald-800 hover:bg-slate-100';
      case 'purple':
        return 'bg-white text-purple-800 hover:bg-slate-100';
      case 'blue':
      default:
        return 'bg-white text-[#1D4ED8] hover:bg-blue-50 font-bold';
    }
  }
}
