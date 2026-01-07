import { Component, Input, SecurityContext, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { SidebarButton } from '../sidebar.config';

@Component({
  selector: 'app-sidebar-button',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-button.component.html',
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
