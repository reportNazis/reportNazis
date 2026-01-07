import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarButtonComponent } from './sidebar-button/sidebar-button.component';
import { SidebarService } from './sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarButtonComponent],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private sidebarService = inject(SidebarService); // Injects service which validates routes

  // We can access config directly from service or inject token if preferred.
  // Accessing via service allows service to potentially modify/filter config.
  config = this.sidebarService.config;

  topButtons = computed(() => this.config.buttons.filter(b => b.position === 'top'));
  bottomButtons = computed(() => this.config.buttons.filter(b => b.position === 'bottom'));
}
