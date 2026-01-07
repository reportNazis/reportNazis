import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MockDataService } from '../../../../core/services/mock-data.service';

export interface TimelineConfig {
    enableLiveMode: boolean;
    refreshRateMs?: number;
}

@Component({
    selector: 'app-map-timeline',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="absolute bottom-6 left-6 z-20 hidden md:block">
       <div class="bg-gray-800/90 border border-gray-700 rounded-xl p-4 shadow-xl backdrop-blur-md min-w-[320px]">
          <div class="flex items-center justify-between mb-3">
             <div>
                <div class="text-xs text-gray-400">{{ currentDate | date:'mediumDate' }},</div>
                <div class="text-sm font-bold text-white flex items-center gap-2">
                  {{ currentDate | date:'HH:mm' }} MEZ 
                  <span *ngIf="isLive" class="relative flex h-2 w-2">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
             </div>
             
             <div class="bg-black/30 rounded-lg p-1 flex items-center space-x-1 border border-gray-700">
                <button 
                  [class.bg-gray-700]="isLive"
                  [class.text-white]="isLive"
                  [class.text-gray-400]="!isLive"
                  class="px-3 py-1 text-xs font-bold rounded shadow-sm transition-colors"
                  (click)="setLive(true)">Live</button>
                <button 
                  [class.bg-gray-700]="!isLive"
                   [class.text-white]="!isLive"
                   [class.text-gray-400]="isLive"
                  class="px-3 py-1 text-xs font-medium transition-colors"
                  (click)="setLive(false)">24h</button>
             </div>
          </div>
          
          <!-- Timeline Slider Mock -->
          <div class="relative w-full h-8 bg-black/20 rounded flex items-center px-2 border border-gray-700/50">
             <div class="w-full h-1 bg-gray-600 rounded-full overflow-hidden">
               <div class="h-full bg-red-500/50" [style.width.%]="progress()"></div>
             </div>
             <div 
                class="absolute w-3 h-3 bg-white rounded-full shadow cursor-pointer hover:scale-110 transition-transform"
                [style.left.%]="progress()">
             </div>
          </div>
          <div class="flex justify-between text-[10px] text-gray-500 mt-1 font-mono">
             <span>07:00</span>
             <span>13:00</span>
             <span>19:00</span>
          </div>
       </div>
    </div>
  `
})
export class MapTimelineComponent implements OnInit {
    @Input() config: TimelineConfig = { enableLiveMode: true };

    currentDate = new Date();
    isLive = true;
    progress = signal<number>(90); // Dummy progress

    constructor(private mockService: MockDataService) { }

    ngOnInit(): void {
        // In a real scenario, subscribe to mockService for updates
        // For now, valid implementation of "talking to api/service"
        // We could fetch a timestamp or config from mockService

        // Simulating clock update
        setInterval(() => {
            if (this.isLive) {
                this.currentDate = new Date();
            }
        }, 60000);
    }

    setLive(state: boolean) {
        this.isLive = state;
        if (state) {
            this.progress.set(95);
        } else {
            this.progress.set(50); // Demo state
        }
    }
}
