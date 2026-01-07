import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarButtonComponent } from './sidebar-button/sidebar-button.component';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarButtonComponent],
  template: `
    <aside class="h-full w-16 md:w-20 flex flex-col items-center py-6 bg-gray-900 border-r border-gray-800 z-50">
      
      <!-- Logo / Brand Icon -->
      <div class="mb-8 p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 shadow-lg shadow-emerald-900/50 cursor-pointer hover:scale-105 transition-transform">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>

      <!-- Nav Items -->
      <nav class="flex-1 flex flex-col w-full items-center space-y-6">
        @for (button of topButtons(); track button.id) {
          <app-sidebar-button [config]="button"></app-sidebar-button>
        }
      </nav>

      <!-- Bottom Actions -->
      <div class="flex flex-col space-y-4 mb-4 items-center w-full">
         @for (button of bottomButtons(); track button.id) {
          <app-sidebar-button [config]="button"></app-sidebar-button>
        }
      </div>

    </aside>
  `
})
export class SidebarComponent {
  private sidebarService = inject(SidebarService); // Injects service which validates routes

  // We can access config directly from service or inject token if preferred.
  // Accessing via service allows service to potentially modify/filter config.
  config = this.sidebarService.config;

  topButtons = computed(() => this.config.buttons.filter(b => b.position === 'top'));
  bottomButtons = computed(() => this.config.buttons.filter(b => b.position === 'bottom'));
}
