import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarButtonComponent } from './sidebar-button/sidebar-button.component';
import { SidebarService } from './sidebar.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, SidebarButtonComponent, MatIconModule],
  templateUrl: './sidebar.component.html'
})
export class SidebarComponent {
  private sidebarService = inject(SidebarService);

  config = this.sidebarService.config;
  isExpanded = signal(false); // Default to collapsed

  topButtons = computed(() => this.config.buttons.filter(b => b.position === 'top'));
  bottomButtons = computed(() => this.config.buttons.filter(b => b.position === 'bottom'));

  toggleSidebar() {
    this.isExpanded.update(val => !val);
  }
}

