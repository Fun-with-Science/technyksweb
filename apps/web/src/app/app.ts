import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavComponent } from './core/components/nav/nav.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { AnnouncementBarComponent } from './core/components/announcement-bar/announcement-bar.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    AnnouncementBarComponent,
    NavComponent,
    FooterComponent,
  ],
  selector: 'app-root',
  template: `
    <div
      class="flex flex-col"
      [class.min-h-screen]="!isImmersiveRoute()"
      [class.h-dvh]="isImmersiveRoute()"
      [class.overflow-hidden]="isImmersiveRoute()"
      [class.light-theme]="!themeService.isDarkMode()"
      [class.dark-theme]="themeService.isDarkMode()"
    >
      @if (!isImmersiveRoute()) {
        <header class="sticky top-0 z-50">
          <app-announcement-bar></app-announcement-bar>
          <app-nav></app-nav>
        </header>
      }
      <main
        [class.flex-grow]="!isImmersiveRoute()"
        [class.h-dvh]="isImmersiveRoute()"
        [class.overflow-hidden]="isImmersiveRoute()"
      >
        <router-outlet></router-outlet>
      </main>
      @if (!isImmersiveRoute()) {
        <app-footer></app-footer>
      }
    </div>
  `,
})
export class App {
  themeService = inject(ThemeService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private currentUrl = signal(this.router.url);
  isImmersiveRoute = computed(
    () => this.currentUrl().split('?')[0] === '/onboarding',
  );
  title = 'web';

  constructor() {
    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.currentUrl.set(event.urlAfterRedirects));
  }
}
