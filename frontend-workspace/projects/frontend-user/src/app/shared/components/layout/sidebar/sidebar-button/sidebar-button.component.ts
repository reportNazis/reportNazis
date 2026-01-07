import { Component, Input, SecurityContext, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SidebarButton } from '../sidebar.config';

@Component({
  selector: 'app-sidebar-button',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <button 
      [routerLink]="config.route"
      routerLinkActive="bg-gray-800 text-white shadow-lg shadow-black/20"
      [routerLinkActiveOptions]="{exact: false}"
      class="p-3 rounded-xl transition-all group relative block w-full"
      [ngClass]="{
        'text-gray-400 hover:text-white hover:bg-gray-800': !isActive(),
        'text-white bg-gray-800 shadow-lg shadow-black/20': isActive()
      }"
    >
      <!-- Icon Container -->
      <div class="h-6 w-6 flex items-center justify-center">
        @if (sanitizedIcon()) {
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" [innerHTML]="sanitizedIcon()">
          </svg>
        } @else if (config.customContent) {
           <div class="h-6 w-6 bg-gray-700 rounded-full flex items-center justify-center border border-gray-600">
             <span class="text-xs font-bold text-gray-300">{{ config.customContent }}</span>
           </div>
        }
      </div>

      <!-- Tooltip -->
      <span class="absolute left-14 top-1/2 -translate-y-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-gray-700 z-50">
        {{ config.label }}
      </span>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class SidebarButtonComponent {
  private sanitizer = inject(DomSanitizer);

  @Input({ required: true }) config!: SidebarButton;

  // This is a placeholder for checking active state if not using RouterLinkActive
  // or if we passed 'active' from config for visual testing.
  // Real active state comes from RouterLinkActive directive usually.
  isActive = computed(() => this.config.active);

  sanitizedIcon = computed(() => {
    if (this.config.icon) {
      return this.sanitizer.sanitize(SecurityContext.HTML, this.config.icon);
    }
    return null;
  });
}
