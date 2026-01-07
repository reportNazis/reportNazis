import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafeHtml } from '@angular/platform-browser';

// Services
import { MockDataService, PollutionData } from '../../../core/services/mock-data.service';
import { MapRenderingService } from '../services/map-rendering.service';
import { MapAnimationsService } from '../services/map-animations.service';

// Components
import { ModalComponent } from '../../../shared/components/modal/modal.component';
import { MapNavbarComponent } from '../components/map-navbar/map-navbar.component';
import { MapSettingsComponent } from '../components/map-settings/map-settings.component';
import { MapLegendComponent, LegendConfig } from '../components/map-legend/map-legend.component';
import { MapTimelineComponent, TimelineConfig } from '../components/map-timeline/map-timeline.component';

@Component({
  selector: 'app-munich-map',
  standalone: true,
  imports: [
    CommonModule,
    ModalComponent,
    MapNavbarComponent,
    MapSettingsComponent,
    MapLegendComponent,
    MapTimelineComponent
  ],
  template: `
    <div class="relative w-full h-full bg-gray-900 border-l border-gray-800 overflow-hidden group">
      
      <!-- 1. Navbar / Search -->
      <app-map-navbar 
        (search)="handleSearch($event)"
        (clear)="handleClearConfig()"
      ></app-map-navbar>

      <!-- 2. Interactive Map Layer -->
      <div class="w-full h-full flex items-center justify-center p-0 m-0 cursor-move">
         <div class="w-full h-full svg-container animate-fadeIn" 
              [innerHTML]="safeSvgContent"
              (click)="handleMapClick($event)">
         </div>
      </div>

      <!-- 3. Settings & Zoom -->
      <app-map-settings
        (zoomIn)="handleZoomIn()"
        (zoomOut)="handleZoomOut()"
        (openSettings)="handleOpenSettings()"
      ></app-map-settings>

      <!-- 4. Legend -->
      <app-map-legend [config]="legendConfig"></app-map-legend>

      <!-- 5. Timeline -->
      <app-map-timeline [config]="timelineConfig"></app-map-timeline>

      <!-- Modal -->
      <app-modal 
        [isVisible]="isModalOpen" 
        [title]="selectedZip()?.zipCode + ' - Report'"
        [config]="{ width: '28rem', closeOnBackdropClick: true }"
        (close)="isModalOpen = false">
        
        <div class="space-y-4">
          <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
             <p class="text-sm text-blue-200">Reporting pollution data for <strong>{{ selectedZip()?.zipCode }}</strong>.</p>
          </div>
          <!-- Form content same as before -->
           <div class="space-y-2">
             <label class="text-xs uppercase text-gray-500 font-bold tracking-wider">Severity Level</label>
             <div class="grid grid-cols-3 gap-2">
               <button class="py-2 rounded bg-gray-700 hover:bg-green-600/20 hover:text-green-400 hover:border-green-500/50 border border-transparent transition-all text-xs font-bold text-gray-300">Low</button>
               <button class="py-2 rounded bg-gray-700 hover:bg-yellow-600/20 hover:text-yellow-400 hover:border-yellow-500/50 border border-transparent transition-all text-xs font-bold text-gray-300">Medium</button>
               <button class="py-2 rounded bg-gray-700 hover:bg-red-600/20 hover:text-red-400 hover:border-red-500/50 border border-transparent transition-all text-xs font-bold text-gray-300">High</button>
             </div>
          </div>
           <div class="space-y-2">
             <label class="text-xs uppercase text-gray-500 font-bold tracking-wider">Obervation Details</label>
             <textarea class="w-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-white text-sm focus:border-gray-500 outline-none transition-colors h-24 resize-none" placeholder="Describe what you see..."></textarea>
          </div>
          <div class="flex justify-end pt-4">
             <button class="w-full py-3 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-colors shadow-lg" (click)="submitReport()">Submit Report</button>
          </div>
        </div>
      </app-modal>

    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }
    :host ::ng-deep .svg-container svg {
       width: 100%;
       height: 100%;
    }
    :host ::ng-deep .svg-container path.map-path {
       transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
       stroke: rgba(255,255,255,0.1); 
       stroke-width: 1px;
    }
    :host ::ng-deep .svg-container path.map-path:hover {
       stroke: white;
       stroke-width: 2px;
       filter: brightness(1.2);
       cursor: pointer;
    }
    :host ::ng-deep .svg-container path.active-search {
       stroke: white;
       stroke-width: 3px;
       filter: drop-shadow(0 0 12px rgba(255,255,255,0.5));
       animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% { filter: drop-shadow(0 0 0 rgba(255,255,255,0.2)); stroke-opacity: 1; }
      50% { filter: drop-shadow(0 0 20px rgba(255,255,255,0.4)); stroke-opacity: 0.8; }
      100% { filter: drop-shadow(0 0 0 rgba(255,255,255,0.2)); stroke-opacity: 1; }
    }
  `]
})
export class MunichMapComponent implements OnInit {

  // Data
  private rawSvg = signal<string>('');
  private pollutionData = signal<PollutionData[]>([]);

  // UI
  safeSvgContent: SafeHtml | null = null;
  selectedZip = signal<PollutionData | null>(null);
  isModalOpen = false;

  // Configurations
  legendConfig: LegendConfig = {
    title: 'CO₂-Intensität',
    unit: 'gCO₂eq/kWh',
    labels: ['0', '300', '600', '900', '1200+']
  };

  timelineConfig: TimelineConfig = {
    enableLiveMode: true
  };

  constructor(
    private mockData: MockDataService,
    private mapRenderer: MapRenderingService,
    private mapAnimations: MapAnimationsService
  ) { }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.mockData.getPollutionData().subscribe(data => {
      this.pollutionData.set(data);
      this.mockData.getMunichMapData().subscribe(svg => {
        this.rawSvg.set(svg);
        this.safeSvgContent = this.mapRenderer.renderMap(svg, data);
      });
    });
  }

  // --- Event Handlers ---

  handleSearch(zip: string) {
    const found = this.pollutionData().find(p => p.zipCode === zip);
    if (found) {
      this.selectedZip.set(found);
      this.mapAnimations.highlightZip(zip);
    } else {
      // Ideally show error toast, or pass error back to navbar if it supports it
      this.selectedZip.set(null);
      this.mapAnimations.clearHighlight();
    }
  }

  handleClearConfig() {
    this.selectedZip.set(null);
    this.mapAnimations.clearHighlight();
  }

  handleMapClick(event: Event) {
    const target = event.target as SVGElement;
    const zip = target.getAttribute('data-zip');

    if (zip) {
      const data = this.pollutionData().find(p => p.zipCode === zip);
      if (data) {
        this.selectedZip.set(data);
        this.isModalOpen = true;
      }
    }
  }

  handleZoomIn() { console.log('Zoom In'); }
  handleZoomOut() { console.log('Zoom Out'); }
  handleOpenSettings() { console.log('Settings'); }

  submitReport() {
    this.isModalOpen = false;
    // Logic to save report via service
    alert('Report submitted for ' + this.selectedZip()?.zipCode);
  }
}
