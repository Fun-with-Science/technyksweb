import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NavComponent } from './core/components/nav/nav.component';
import { FooterComponent } from './core/components/footer/footer.component';

@Component({
  standalone: true,
  imports: [RouterModule, NavComponent, FooterComponent],
  selector: 'app-root',
  template: `
    <div class="min-h-screen flex flex-col bg-[#040810] text-[#e0e3e5]">
      <app-nav></app-nav>
      <main class="flex-grow">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `,
})
export class App {
  title = 'web';
}
