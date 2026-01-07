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

  // Computed signal for the button's CSS classes
  buttonClasses = computed(() => {
    const cfg = this.config();
    const expanded = this.isExpanded();
    const active = cfg.active;
    const isSignIn = cfg.id === 'sign-in';

    const baseClasses = 'rounded-lg transition-all group relative flex items-center w-full';
    const classes: string[] = [baseClasses];

    if (isSignIn) {
      classes.push('bg-[#0f6b4a] !text-white hover:bg-[#128159] justify-center');
      if (expanded) {
        classes.push('rounded-full px-5 py-2 mt-2 mx-1');
      } else {
        classes.push('!rounded-full p-2.5 mb-1');
      }
    } else {
      // Regular menu button
      if (expanded) {
        classes.push('px-3 py-2 gap-3');
      } else {
        classes.push('p-2.5');
      }

      if (active) {
        // Active state classes are handled by routerLinkActive usually, 
        // but we can add them here if 'active' is true in config for testing.
        classes.push('bg-gray-800 text-white shadow-sm');
      } else {
        classes.push('text-gray-400 hover:text-white hover:bg-gray-800/50');
      }
    }

    return classes.join(' ');
  });

  isActive = computed(() => this.config().active);
}
