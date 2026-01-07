import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarButton } from '../sidebar.config';

@Component({
  selector: 'app-sidebar-button',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar-button.component.html',
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class SidebarButtonComponent {
  config = input.required<SidebarButton>();
  isExpanded = input<boolean>(false);

  // This is a placeholder for checking active state if not using RouterLinkActive
  // or if we passed 'active' from config for visual testing.
  // Real active state comes from RouterLinkActive directive usually.
  isActive = computed(() => this.config().active);
}
