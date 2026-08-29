import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavComponent } from './core/components/nav/nav.component';
import { FooterComponent } from './core/components/footer/footer.component';
import { ThemeService } from './core/services/theme.service';

@Component({
  standalone: true,
  imports: [RouterModule, NavComponent, FooterComponent],
  selector: 'app-root',
  template: `
    <div
      class="min-h-screen flex flex-col"
      [class.light-theme]="!themeService.isDarkMode()"
      [class.dark-theme]="themeService.isDarkMode()"
    >
      <app-nav></app-nav>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
})
export class App {
  themeService = inject(ThemeService);
  title = 'web';
}
