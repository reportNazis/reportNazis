import { Component, OnInit, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MockDataService, PollutionData } from '../../../core/services/mock-data.service';
import { PollutionColorService } from '../../../core/services/pollution-color.service';
import { ModalComponent } from '../../../shared/components/modal/modal.component';

@Component({
  selector: 'app-munich-map',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ModalComponent],
  template: `
    <div class="relative w-full h-full bg-gray-900 border-l border-gray-800 overflow-hidden group">
      
      <!-- 1. Floating Search Bar (Top-Left) -->
      <div class="absolute top-6 left-6 z-20 w-80">
        <div class="relative group/search">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400 group-focus-within/search:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          <input 
            [formControl]="searchControl"
            type="text" 
            placeholder="Land oder Region suchen" 
            class="block w-full pl-10 pr-3 py-3 bg-gray-800/90 border border-gray-700 rounded-full text-sm placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent focus:bg-gray-800 shadow-xl backdrop-blur-sm transition-all"
          />
          <span *ngIf="searchError" class="absolute top-full mt-2 left-4 text-red-500 text-xs font-semibold bg-gray-900/80 px-2 py-1 rounded shadow-lg">{{ searchError }}</span>
        </div>
      </div>

      <!-- 2. Interactive Map Layer -->
      <div class="w-full h-full flex items-center justify-center p-0 m-0 cursor-move">
         <div class="w-full h-full svg-container animate-fadeIn" [innerHTML]="safeSvgContent"></div>
      </div>

      <!-- 3. Floating Controls (Top-Right) -->
      <div class="absolute top-6 right-6 z-20 flex flex-col items-center space-y-4">
        <!-- Settings Cog -->
         <button class="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-700 flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
         </button>

         <!-- Zoom Controls -->
         <div class="flex flex-col bg-gray-800/90 rounded-lg border border-gray-700 shadow-lg backdrop-blur-sm overflow-hidden">
           <button class="w-10 h-10 hover:bg-gray-700 text-white flex items-center justify-center border-b border-gray-700 transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
             </svg>
           </button>
           <button class="w-10 h-10 hover:bg-gray-700 text-white flex items-center justify-center transition-colors">
             <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
               <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
             </svg>
           </button>
         </div>
      </div>

      <!-- 4. Floating Legend (Bottom-Right) -->
      <div class="absolute bottom-6 right-6 z-20 flex flex-col items-end space-y-2">
         <div class="bg-gray-800/90 border border-gray-700 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md">
            <div class="flex justify-between items-center mb-2">
              <span class="text-xs font-bold text-white tracking-wide">CO₂-Intensität</span>
              <span class="text-xs text-gray-400 font-mono">gCO₂eq/kWh</span>
            </div>
            
            <!-- Gradient Bar -->
            <div class="w-64 h-2 rounded-full mb-1" 
                 [style.background]="gradientStyle">
            </div>

            <!-- Labels -->
            <div class="w-64 flex justify-between text-[10px] text-gray-400 font-mono font-medium">
               <span>0</span>
               <span>300</span>
               <span>600</span>
               <span>900</span>
               <span>1200+</span>
            </div>
         </div>
      </div>

      <!-- 5. Timeline Control (Bottom-Left) -->
      <div class="absolute bottom-6 left-6 z-20 hidden md:block">
         <div class="bg-gray-800/90 border border-gray-700 rounded-xl p-4 shadow-xl backdrop-blur-md min-w-[320px]">
            <div class="flex items-center justify-between mb-3">
               <div>
                  <div class="text-xs text-gray-400">7. Jan. 2026,</div>
                  <div class="text-sm font-bold text-white flex items-center gap-2">
                    01:15 MEZ 
                    <span class="relative flex h-2 w-2">
                       <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                       <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </span>
                  </div>
               </div>
               
               <div class="bg-black/30 rounded-lg p-1 flex items-center space-x-1 border border-gray-700">
                  <button class="px-3 py-1 bg-gray-700 text-white text-xs font-bold rounded shadow-sm">Live</button>
                  <button class="px-3 py-1 text-gray-400 hover:text-white text-xs font-medium transition-colors">24h</button>
               </div>
            </div>
            
            <!-- Timeline Slider Mock -->
            <div class="relative w-full h-8 bg-black/20 rounded flex items-center px-2 border border-gray-700/50">
               <div class="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
                 <div class="w-[90%] h-full bg-red-500/50"></div>
               </div>
               <div class="absolute right-4 w-3 h-3 bg-white rounded-full shadow cursor-pointer hover:scale-110 transition-transform"></div>
            </div>
            <div class="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
               <span>07:00</span>
               <span>13:00</span>
               <span>19:00</span>
            </div>
         </div>
      </div>

       <!-- Trigger Reporting Modal (Hidden Trigger via Map Click mostly, but kept for MVP access) -->
       <!-- We'll attach the click listener to map paths primarily, but keep a discreet button? -->
       <!-- Removing the big red button to match the minimalist style. 
            Reporting will be triggered by clicking a district. -->

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

    /* SVG Styling */
    :host ::ng-deep .svg-container svg {
       width: 100%;
       height: 100%;
       /* Invert filter to make the light grey mock map dark? Or just CSS fill logic. 
          Since we inject standard light grey paths, let's override via CSS if possible 
          or rely on the JS processor to set the attributes. 
          Using CSS to force base styles for dark mode.
       */
    }
    
    :host ::ng-deep .svg-container path {
       transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
       stroke: rgba(255,255,255,0.1); 
       stroke-width: 1px;
    }

    :host ::ng-deep .svg-container path:hover {
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

  // Computed gradient style for Legend
  gradientStyle = '';

  searchControl = new FormControl('', [Validators.pattern(/^[0-9]{5}$/)]);
  searchError: string | null = null;

  constructor(
    private mockData: MockDataService,
    private colorService: PollutionColorService,
    private sanitizer: DomSanitizer
  ) {
    const colors = this.colorService.getGradientColors();
    this.gradientStyle = `linear-gradient(to right, ${colors.join(', ')})`;
  }

  ngOnInit(): void {
    this.loadData();

    this.searchControl.valueChanges.subscribe(val => {
      if (this.searchControl.valid && val) {
        this.highlightZip(val);
      } else {
        this.clearHighlight();
      }
    });
  }

  private loadData(): void {
    this.mockData.getPollutionData().subscribe(data => {
      this.pollutionData.set(data);
      this.mockData.getMunichMapData().subscribe(svg => {
        this.rawSvg.set(svg);
        this.processSvg(svg, data);
      });
    });
  }

  private processSvg(svgString: string, data: PollutionData[]) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgString, 'image/svg+xml');

    // Set base background color for paths found that DON'T have data?
    // Actually the mock SVG has specific paths.

    // 1. Colorize Paths
    data.forEach(item => {
      const pathId = `zip-${item.zipCode}`;
      const element = doc.getElementById(pathId);
      if (element) {
        const color = this.colorService.getColor(item.score);
        element.setAttribute('fill', color);
        element.setAttribute('data-zip', item.zipCode);

        // Add click listener support via a hack:
        // Angular doesn't easily bind events to injected HTML.
        // We will rely on global event delegation or just the hover effect for now.
        // For MVP reporting trigger, we will implement a global click listener on the container.
      }
    });

    const serializedSvg = new XMLSerializer().serializeToString(doc.documentElement);
    this.safeSvgContent = this.sanitizer.bypassSecurityTrustHtml(serializedSvg);

    // Re-attach listeners after render tick
    setTimeout(() => this.attachClickListeners(), 100);
  }

  // Event Delegation for SVG Clicks
  attachClickListeners() {
    const container = document.querySelector('.svg-container');
    if (container) {
      container.addEventListener('click', (e: any) => {
        const target = e.target as SVGElement;
        // Check if clicked element is a path with data-zip
        const zip = target.getAttribute('data-zip'); // Our mock data service didn't inject data-zip into SVG initially, we need to ensure it does or we did it in processSvg
        const id = target.id;

        if (id && id.startsWith('zip-')) {
          const zipCode = id.replace('zip-', '');
          const data = this.pollutionData().find(p => p.zipCode === zipCode);
          if (data) {
            this.selectedZip.set(data);
            this.isModalOpen = true; // Open report modal on click
          }
        }
      });
    }
  }


  highlightZip(zip: string) {
    const found = this.pollutionData().find(p => p.zipCode === zip);
    if (found) {
      this.searchError = null;
      this.selectedZip.set(found);

      const svgContainer = document.querySelector('.svg-container');
      if (svgContainer) {
        const oldActive = svgContainer.querySelectorAll('.active-search');
        oldActive.forEach(el => el.classList.remove('active-search'));

        const target = svgContainer.querySelector(`#zip-${zip}`);
        if (target) {
          target.classList.add('active-search');
          // Optional: Zoom to element?
        }
      }
    } else {
      this.searchError = 'Region unavailable';
      this.selectedZip.set(null);
    }
  }

  clearHighlight() {
    this.searchError = null;
    this.selectedZip.set(null);
    const svgContainer = document.querySelector('.svg-container');
    if (svgContainer) {
      const oldActive = svgContainer.querySelectorAll('.active-search');
      oldActive.forEach(el => el.classList.remove('active-search'));
    }
  }

  submitReport() {
    // Fake submission
    this.isModalOpen = false;
    alert('Report submitted for ' + this.selectedZip()?.zipCode);
  }
}
