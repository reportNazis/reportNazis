import { Component } from '@angular/core';
import { SidebarComponent } from './shared/components/layout/sidebar/sidebar.component';
import { MapCanvasComponent } from './shared/components/map-canvas/map-canvas';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, SidebarComponent, MapCanvasComponent],
  template: `
   <div class="relative flex h-screen w-screen overflow-hidden font-sans text-gray-200">
      <!-- Map Canvas (Background) -->
      <app-map-canvas></app-map-canvas>

      <!-- UI Layer (Overlay) -->
      <div class="relative z-10 flex w-full h-full pointer-events-none">
          <!-- Sidebar -->
          <app-sidebar class="pointer-events-auto"></app-sidebar>
          
          <!-- Main Content -->
          <main class="flex-1 relative h-full overflow-hidden pointer-events-none">
            <router-outlet></router-outlet>
          </main>
      </div>
   </div>
  `
})
export class AppComponent {
  title = 'frontend-user';
}
