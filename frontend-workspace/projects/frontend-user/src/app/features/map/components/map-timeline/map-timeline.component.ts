import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // For ngModel if we used it, but let's stick to simple change handlers or Event binding
import { Router } from '@angular/router';

export interface TimelineConfig {
  range: string;   // e.g. 'live', '24h', '30d'
  interval: string; // e.g. '15m', '1h', '1d'
}

type RangeOption = { label: string; value: string; allowedIntervals: string[] };
type IntervalOption = { label: string; value: string };

@Component({
  selector: 'app-map-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="absolute bottom-6 left-6 z-20 hidden md:block group">
       <!-- Controls Header -->
       <div class="absolute bottom-full left-0 mb-2 flex space-x-2 transition-opacity duration-200"
            [class.opacity-0]="!isHovered && !isMenuOpen" 
            [class.opacity-100]="isHovered || isMenuOpen">
          
          <!-- Range Dropdown -->
          <div class="relative">
             <button (click)="toggleRangeMenu()"
                     class="bg-gray-900/90 text-white text-xs font-bold px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 flex items-center gap-2 shadow-lg backdrop-blur">
                {{ getLabelForRange(config.range) }}
                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </button>
             
             <div *ngIf="showRangeMenu" class="absolute bottom-full left-0 mb-1 w-40 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                <button *ngFor="let opt of rangeOptions" 
                        (click)="selectRange(opt.value)"
                        class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800 last:border-0 block">
                  {{ opt.label }}
                </button>
             </div>
          </div>

          <!-- Interval Dropdown -->
          <div class="relative">
             <button (click)="toggleIntervalMenu()"
                     class="bg-gray-900/90 text-white text-xs font-bold px-3 py-2 rounded-lg border border-gray-700 hover:bg-gray-800 flex items-center gap-2 shadow-lg backdrop-blur">
                {{ getLabelForInterval(config.interval) }}
                <svg class="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
             </button>
             
             <div *ngIf="showIntervalMenu" class="absolute bottom-full left-0 mb-1 w-32 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                <button *ngFor="let opt of getAvailableIntervals()" 
                        (click)="selectInterval(opt.value)"
                        class="w-full text-left px-4 py-2 text-xs text-gray-300 hover:bg-gray-800 hover:text-white transition-colors border-b border-gray-800 last:border-0 block">
                  {{ opt.label }}
                </button>
             </div>
          </div>
       </div>

       <!-- Main Timeline Bar -->
       <div class="bg-gray-800/90 border border-gray-700 rounded-xl p-4 shadow-xl backdrop-blur-md min-w-[360px] relative"
            (mouseenter)="isHovered = true" (mouseleave)="isHovered = false">
            
          <!-- Info Row -->
          <div class="flex items-center justify-between mb-4">
             <div>
                <div class="text-xs text-gray-400">{{ timelineDate | date:'mediumDate' }},</div>
                <div class="text-sm font-bold text-white flex items-center gap-2">
                  {{ timelineDate | date:'HH:mm' }} 
                  <span *ngIf="config.range === 'live'" class="relative flex h-2 w-2">
                     <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                     <span class="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                </div>
             </div>
             
             <!-- Navigation Arrows (for days/months) -->
             <div class="flex items-center space-x-1">
                <button (click)="shiftTime(-1)" class="w-8 h-8 rounded-full bg-black/40 hover:bg-gray-700 text-white flex items-center justify-center transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <button (click)="shiftTime(1)" class="w-8 h-8 rounded-full bg-black/40 hover:bg-gray-700 text-white flex items-center justify-center transition-colors">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
             </div>
          </div>
          
          <!-- Slider Track -->
          <div class="relative w-full h-10 bg-black/20 rounded flex items-center px-4 border border-gray-700/50 cursor-pointer"
               (click)="onTrackClick($event)">
             
             <!-- Ticks -->
             <div class="absolute inset-x-4 bottom-1 flex justify-between pointer-events-none">
                 <div *ngFor="let tick of ticks" class="h-1 w-px bg-gray-600"></div>
             </div>

             <!-- Filled Bar -->
             <div class="absolute left-4 h-1.5 bg-gray-600 rounded-full overflow-hidden" [style.right.px]="16">
               <div class="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-80" [style.width.%]="progress"></div>
             </div>

             <!-- Handle -->
             <div class="absolute w-4 h-4 bg-white border-2 border-gray-800 rounded-full shadow-lg cursor-grab active:cursor-grabbing hover:scale-110 transition-transform z-10"
                  [style.left.%]="progress"
                  style="transform: translateX(-50%); margin-left: 16px; margin-right: 16px;"> <!-- Crude positioning fix -->
             </div>
          </div>

          <!-- Labels -->
          <div class="flex justify-between text-[10px] text-gray-500 mt-2 font-mono uppercase tracking-wider">
             <span>Start</span>
             <span>End</span>
          </div>
       </div>
    </div>
  `
})
export class MapTimelineComponent implements OnInit, OnChanges {
  @Input() config: TimelineConfig = { range: 'live', interval: '15m' };
  @Output() dateChange = new EventEmitter<Date>();

  isHovered = false;
  showRangeMenu = false;
  showIntervalMenu = false;

  timelineDate = new Date();
  progress = 100; // Percentage 0-100

  // Configuration Constants
  rangeOptions: RangeOption[] = [
    { label: 'Live', value: 'live', allowedIntervals: ['15m', '1h'] },
    { label: 'Last 24 Hours', value: '24h', allowedIntervals: ['15m', '1h'] },
    { label: 'Last 30 Days', value: '30d', allowedIntervals: ['1d'] },
    { label: 'Last 12 Months', value: '12m', allowedIntervals: ['1mo'] },
    { label: 'All Time', value: 'all', allowedIntervals: ['1y'] },
  ];

  intervalOptions: IntervalOption[] = [
    { label: '15 Minutes', value: '15m' },
    { label: 'Hourly', value: '1h' },
    { label: 'Daily', value: '1d' },
    { label: 'Monthly', value: '1mo' },
    { label: 'Yearly', value: '1y' },
  ];

  ticks = new Array(12);

  constructor(private router: Router) { }

  ngOnInit() { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config']) {
      // Reset or adjust state based on new config
      this.progress = 100; // Reset to latest on config change?
      this.timelineDate = new Date();
    }
  }

  get isMenuOpen() { return this.showRangeMenu || this.showIntervalMenu; }

  toggleRangeMenu() { this.showRangeMenu = !this.showRangeMenu; this.showIntervalMenu = false; }
  toggleIntervalMenu() { this.showIntervalMenu = !this.showIntervalMenu; this.showRangeMenu = false; }

  getLabelForRange(val: string) { return this.rangeOptions.find(o => o.value === val)?.label || val; }
  getLabelForInterval(val: string) { return this.intervalOptions.find(o => o.value === val)?.label || val; }

  getAvailableIntervals() {
    const currentRangeOpt = this.rangeOptions.find(r => r.value === this.config.range);
    if (!currentRangeOpt) return this.intervalOptions;
    return this.intervalOptions.filter(i => currentRangeOpt.allowedIntervals.includes(i.value));
  }

  selectRange(range: string) {
    const opt = this.rangeOptions.find(r => r.value === range);
    // Default to first allowable interval
    const newInterval = opt?.allowedIntervals[0] || '1h';
    this.navigate(range, newInterval);
    this.showRangeMenu = false;
  }

  selectInterval(interval: string) {
    this.navigate(this.config.range, interval);
    this.showIntervalMenu = false;
  }

  navigate(range: string, interval: string) {
    this.router.navigate(['map', range, interval]);
  }

  // Interaction (Mock)
  shiftTime(direction: number) {
    // Logic to shift date window
    console.log('Shift time', direction);
  }

  onTrackClick(e: MouseEvent) {
    // Simple click to seek logic
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left - 16; // Padding adjust
    const width = rect.width - 32;
    let pct = (x / width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    this.progress = pct;

    // Calculate simulated date from progress
    // For now, just emit 'now'
    this.dateChange.emit(new Date());
  }
}
