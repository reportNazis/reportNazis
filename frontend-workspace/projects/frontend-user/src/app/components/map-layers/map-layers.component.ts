import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayerService } from '../../services/layer.service';

@Component({
  selector: 'app-map-layers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Floating Button (Bottom Right) -->
    <button 
      (click)="toggleMenu()"
      class="absolute bottom-9 right-80 z-50 bg-white/10 backdrop-blur-md border border-white/20 p-3 rounded-full shadow-lg hover:bg-white/20 transition-all active:scale-95 text-white"
      [class.hidden]="isOpen()"
      aria-label="Layers"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    </button>

    <!-- Layers Menu Overlay -->
    <div 
      *ngIf="isOpen()"
      class="absolute bottom-6 right-80 z-50 w-80 bg-[#1a1c22]/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b border-white/5">
        <h3 class="text-sm font-semibold text-white/90">Map Layers</h3>
        <button (click)="closeMenu()" class="text-white/50 hover:text-white transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>

      <!-- Content Scroll -->
      <div class="p-4 space-y-6 max-h-[60vh] overflow-y-auto">
        
        <!-- Section: Data Sources -->
        <div class="space-y-3">
          <h4 class="text-xs font-semibold text-white/50 uppercase tracking-wider">Data Source</h4>
          <div class="grid grid-cols-1 gap-2">
            @for (source of layerService.availableDataSources(); track source.id) {
              <button 
                (click)="layerService.setDataSource(source.id)"
                class="flex items-center gap-3 p-3 rounded-xl border transition-all text-left group"
                [class.bg-white/10]="isActive(source.id)"
                [class.border-white/20]="isActive(source.id)"
                [class.border-transparent]="!isActive(source.id)"
                [class.hover:bg-white/5]="!isActive(source.id)"
              >
                <!-- Icon Placeholder -->
                <div class="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shrink-0"> 
                
                <ng-container [ngSwitch]="source.id">
                    <span *ngSwitchCase="'co2'" class="text-green-400 text-xs font-bold">CO₂</span>
                    <span *ngSwitchCase="'price'" class="text-blue-400 text-xs font-bold">€</span>
                    <span *ngSwitchCase="'renewable'" class="text-yellow-400 text-xs font-bold">%</span>
                  </ng-container>
                </div>
                
                <div class="flex-1">
                  <div class="text-sm font-medium text-white group-hover:text-white/90">
                    {{ source.label }}
                  </div>
                  <div class="text-[10px] text-white/40 leading-tight mt-0.5">
                    {{ source.description }}
                  </div>
                </div>

                <!-- Checkmark -->
                @if (isActive(source.id)) {
                  <div class="text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                }
              </button>
            }
          </div>
        </div>

        <!-- Section: Political Spectrum -->
        <div class="space-y-3">
          <h4 class="text-xs font-semibold text-white/50 uppercase tracking-wider">Political Spectrum</h4>
          <div class="flex flex-wrap gap-2">
            @for (layer of layerService.politicalSpectrum(); track layer.id) {
              <button 
                (click)="layerService.togglePoliticalSpectrumLayer(layer.id)"
                class="flex items-center gap-2 px-3 py-2 rounded-full border text-xs font-medium transition-all"
                [style.background-color]="layer.active ? layer.hexColor : null"
                [style.border-color]="layer.active ? layer.hexColor : null"
                [class.text-white]="layer.active" 
                [class.bg-transparent]="!layer.active"
                [class.text-white/70]="!layer.active"
                [class.border-white/20]="!layer.active"
                [class.hover:bg-white/5]="!layer.active"
              >

              <ng-container>
                @switch (layer.id) {
                  @case ('links') {
                    <span>💨</span>
                  }
                  @case ('rechts') {
                    <span>☀️</span>
                  }
                }
              </ng-container>
                {{ layer.label }}
              </button>
            }
          </div>
        </div>

      </div>
    </div>
    
    <!-- Backdrop Click to Close -->
    <div 
        *ngIf="isOpen()"
        (click)="closeMenu()"
        class="fixed inset-0 z-40 bg-transparent"
    ></div>
  `
})
export class MapLayersComponent {
  layerService = inject(LayerService);

  // Local UI State
  isOpen = signal(false);

  isActive(sourceId: string): boolean {
    return this.layerService.activeDataSource().id === sourceId;
  }

  toggleMenu() {
    this.isOpen.update(v => !v);
  }

  closeMenu() {
    this.isOpen.set(false);
  }
}
