import { Component, EventEmitter, Output, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayerService } from '../../../../services/layer.service';

@Component({
  selector: 'app-map-settings',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="absolute top-6 right-6 z-20 flex flex-col items-end space-y-4">
      <!-- Settings Cog -->
       <div class="relative">
           <button 
                (click)="toggleSettings()" 
                class="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-700 flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors"
                [class.bg-gray-700]="isOpen()"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
           </button>

           <!-- Settings Modal/Popover -->
           <div *ngIf="isOpen()" 
                (click)="$event.stopPropagation()"
                class="absolute top-0 right-14 w-80 bg-[#1a1c22]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 z-30 animate-in fade-in slide-in-from-right-2 duration-200"
            >
               <!-- Political Spectrum Toggle -->
               <div class="mb-6 relative border-b border-white/5">
                <div class="mt-2 text-xs text-gray-400 leading-relaxed animate-in fade-in duration-200">
                   </div>
                   <div class="relative flex w-full h-10 bg-gray-900/80 rounded-full p-1 cursor-pointer border border-white/5 shadow-inner">
                       <!-- Sliding Pill -->
                       <div class="absolute h-8 w-[calc(50%-4px)] rounded-full transition-all duration-300 ease-out shadow-md z-0"
                            [style.backgroundColor]="activeSpectrumColor()"
                            [class.translate-x-0]="activeSpectrumLayer()?.id === spectrumLayers()[0]?.id"
                            [class.translate-x-[calc(100%+8px)]]="activeSpectrumLayer()?.id === spectrumLayers()[1]?.id"
                       ></div>

                       <!-- Labels -->
                       <div *ngFor="let layer of spectrumLayers()" 
                            class="flex-1 z-10 flex items-center justify-center transition-colors duration-200"
                            (click)="toggleSpectrum(layer.id)"
                       >
                           <span class="text-sm font-semibold tracking-wide"
                                 [class.text-white]="activeSpectrumLayer()?.id === layer.id"
                                 [class.text-gray-400]="activeSpectrumLayer()?.id !== layer.id"
                                 [class.hover:text-gray-200]="activeSpectrumLayer()?.id !== layer.id"
                           >
                               {{ layer.label }}
                           </span>
                       </div>
                   </div>
                   <div class="mt-3 text-xs text-gray-400">
                    <p class="mb-2 ml-3 mr-3">
                      Wechsel zwischen Datensätzen der linken und rechten Szene.
                   </p>
                   </div>
                   
               </div>

               <!-- Theme Toggle -->
                <div class="mb-6">
                    <h3 class="text-sm font-medium text-gray-400 mb-3">Thema ändern</h3>
                    <div class="flex bg-black/40 rounded-lg p-1 border border-white/5">
                        <button 
                            (click)="setTheme('light')"
                            class="flex-1 py-1.5 px-3 rounded-md transition-all flex justify-center"
                            [class.text-white]="theme() === 'light'"
                            [class.bg-white/20]="theme() === 'light'"
                            [class.text-white/50]="theme() !== 'light'"
                            [class.hover:text-white]="theme() !== 'light'"
                            [class.hover:bg-white/5]="theme() !== 'light'"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                        </button>
                        <button 
                            (click)="setTheme('dark')"
                            class="flex-1 py-1.5 px-3 rounded-md transition-all flex justify-center"
                            [class.text-white]="theme() === 'dark'"
                            [class.bg-white/20]="theme() === 'dark'"
                            [class.text-white/50]="theme() !== 'dark'"
                            [class.hover:text-white]="theme() !== 'dark'"
                            [class.hover:bg-white/5]="theme() !== 'dark'"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                        </button>
                        <button 
                            (click)="setTheme('system')"
                            class="flex-1 py-1.5 px-3 rounded-md transition-all flex justify-center"
                            [class.text-white]="theme() === 'system'"
                            [class.bg-white/20]="theme() === 'system'"
                            [class.text-white/50]="theme() !== 'system'"
                            [class.hover:text-white]="theme() !== 'system'"
                            [class.hover:bg-white/5]="theme() !== 'system'"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                        </button>
                    </div>
                </div>

                <!-- Colorblind Mode -->
                <div class="flex items-center justify-between mb-6 py-2 border-t border-b border-white/5">
                    <span class="text-sm font-medium text-gray-300">Farbenblind-Modus</span>
                    <!-- Simple Toggle Switch -->
                    <button 
                        (click)="toggleColorblind()"
                        class="w-10 h-6 rounded-full relative transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                        [class.bg-emerald-500]="isColorblind()"
                        [class.bg-gray-600]="!isColorblind()"
                    >
                        <span 
                            class="absolute top-1 bg-white w-4 h-4 rounded-full transition-transform"
                            [class.left-1]="!isColorblind()"
                            [class.left-5]="isColorblind()"
                        ></span>
                    </button>
                </div>

                <!-- About Section -->
                <div>
                   <button (click)="toggleAbout()" class="flex items-center justify-between w-full text-left group">
                        <span class="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">Über reportNazis</span>
                        <svg [class.rotate-180]="isAboutOpen()" class="text-gray-500 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                   </button>
                   
                   <div *ngIf="isAboutOpen()" class="mt-2 text-xs text-gray-400 leading-relaxed animate-in fade-in duration-200">
                        <p class="mb-2">
                            reportNazis bietet eine Open Source Intelligence Plattform die in Echtzeit Informationen über rechte Strukturen liefert.
                        </p>
                        <div class="flex flex-col gap-1 mt-3">
                            <a href="#" class="text-emerald-500 hover:text-emerald-400 hover:underline">Privacy Policy</a>
                            <a href="#" class="text-emerald-500 hover:text-emerald-400 hover:underline">Legal Notice</a>
                        </div>
                        <p class="mt-3 text-white/30">App-Version: to-be-integrated</p>
                   </div>
                </div>

           </div>
       </div>

       <!-- Zoom Controls -->
       <div class="flex flex-col bg-gray-800/90 rounded-lg border border-gray-700 shadow-lg backdrop-blur-sm overflow-hidden">
         <button (click)="zoomIn.emit()" class="w-10 h-10 hover:bg-gray-700 text-white flex items-center justify-center border-b border-gray-700 transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
           </svg>
         </button>
         <button (click)="zoomOut.emit()" class="w-10 h-10 hover:bg-gray-700 text-white flex items-center justify-center transition-colors">
           <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fill-rule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clip-rule="evenodd" />
           </svg>
         </button>
       </div>
       
         <!-- Backdrop Click to Close -->
        <div 
            *ngIf="isOpen()"
            (click)="toggleSettings()"
            class="fixed inset-0 z-10 bg-transparent"
        ></div>
    </div>
  `
})
export class MapSettingsComponent {
  @Output() zoomIn = new EventEmitter<void>();
  @Output() zoomOut = new EventEmitter<void>();
  // @Output() openSettings = new EventEmitter<void>(); // Removed in favor of internal modal

  isOpen = signal(false);
  isAboutOpen = signal(true); // Default open as per screenshot
  theme = signal<'light' | 'dark' | 'system'>('system');
  isColorblind = signal<boolean>(false);

  private layerService = inject(LayerService);

  // Political Spectrum Logic
  spectrumLayers = this.layerService.politicalSpectrum;

  activeSpectrumLayer = computed(() => {
    // Find the active layer from the spectrum layers list
    // verification: layer.Service returns them with an 'active' boolean but we also know the active type
    const type = this.layerService.activeDataSourceType(); // 'links' or 'rechts'
    return this.spectrumLayers().find(l => l.dataSourceType === type);
  });

  activeSpectrumColor = computed(() => {
    return this.activeSpectrumLayer()?.hexColor || '#4B5563'; // Fallback to gray-600
  });

  toggleSpectrum(layerId: string) {
    this.layerService.togglePoliticalSpectrumLayer(layerId);
  }

  toggleSettings() {
    this.isOpen.update(v => !v);
  }

  toggleAbout() {
    this.isAboutOpen.update(v => !v);
  }

  setTheme(theme: 'light' | 'dark' | 'system') {
    this.theme.set(theme);
    console.log('Theme set to:', theme);
  }

  toggleColorblind() {
    this.isColorblind.update(v => !v);
    console.log('Colorblind mode:', this.isColorblind());
  }
}
