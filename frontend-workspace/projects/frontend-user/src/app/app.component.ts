import { Component } from '@angular/core';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, SidebarComponent],
  template: `
   <div class="flex h-screen w-screen bg-gray-900 overflow-hidden font-sans text-gray-200">
      <!-- Sidebar -->
      <app-sidebar></app-sidebar>
      
      <!-- Main Content -->
      <main class="flex-1 relative h-full overflow-hidden">
        <router-outlet></router-outlet>
      </main>
   </div>
  `
})
export class AppComponent {
  title = 'frontend-user';
}
