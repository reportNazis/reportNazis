import { Component, EventEmitter, input, OnInit, Output, HostListener, ViewChild, ElementRef, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TimelineConfig, DEFAULT_TIMELINE_CONFIG } from '../../../../config/map/map-timeline.config';

type RangeOption = { label: string; value: string; allowedIntervals: string[] };
type IntervalOption = { label: string; value: string };

@Component({
  selector: 'app-map-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="absolute bottom-6 left-6 z-20 md:block group">
       <!-- Main Container -->
       <div class="bg-[#1a1c1e]/90 border border-gray-700/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl w-fit min-w-[480px] relative transition-all duration-300">
            
          <!-- Header Area -->
          <div class="flex items-start justify-between gap-12 mb-8">
             <!-- Date & Time (Stacked) -->
             <div class="flex flex-col">
                <div class="text-[14px] font-medium text-gray-300 leading-tight">
                  {{ timelineDate | date:'d. MMM. y,' }}
                </div>
                <div class="flex items-center gap-2 mt-0.5">
                   <div class="text-[20px] font-bold text-white tracking-tight">
                     {{ timelineDate | date:'HH:mm' }} MEZ
                   </div>
                   <!-- Live Icon -->
                   <div *ngIf="config().range === 'live'" class="flex items-center gap-1.5 ml-1 text-red-500 opacity-80">
                      <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                         <circle cx="12" cy="12" r="2" fill="currentColor"></circle>
                         <path d="M16.24 7.76a6 6 0 0 1 0 8.48m-8.48 0a6 6 0 0 1 0-8.48m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"></path>
                      </svg>
                   </div>
                </div>
             </div>

             <!-- Controls Side -->
             <div class="flex items-center bg-black/40 rounded-xl p-1 border border-white/10">
                <!-- Range Dropdown -->
                <div class="relative border-r border-white/10 last:border-0 px-1">
                   <button (click)="toggleRangeMenu()"
                           class="text-white text-sm font-bold px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap min-w-[100px] justify-between group/btn">
                      {{ getLabelForRange(config().range) }}
                      <svg class="w-4 h-4 text-gray-400 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11l-7 7-7-7"></path></svg>
                   </button>
                   
                   <div *ngIf="showRangeMenu" class="absolute bottom-full left-0 mb-3 w-48 bg-[#1a1c1e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      <button *ngFor="let opt of rangeOptions" 
                              (click)="selectRange(opt.value)"
                              class="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-gray-800 last:border-0 block">
                        {{ opt.label }}
                      </button>
                   </div>
                </div>

                <!-- Interval Dropdown -->
                <div class="relative px-1">
                   <button (click)="toggleIntervalMenu()"
                           class="text-white text-sm font-bold px-3 py-2 hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap min-w-[100px] justify-between group/btn">
                      {{ getLabelForInterval(config().interval) }}
                      <svg class="w-4 h-4 text-gray-400 group-hover/btn:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 11l-7 7-7-7"></path></svg>
                   </button>
                   
                   <div *ngIf="showIntervalMenu" class="absolute bottom-full left-0 mb-3 w-40 bg-[#1a1c1e] border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50">
                      <button *ngFor="let opt of getAvailableIntervals()" 
                              (click)="selectInterval(opt.value)"
                              class="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-colors border-b border-gray-800 last:border-0 block">
                        {{ opt.label }}
                      </button>
                   </div>
                </div>
             </div>
          </div>
          
          <!-- Slider Track -->
          <div #track class="relative w-full h-[6px] bg-white/10 rounded-full flex items-center select-none cursor-pointer mb-8"
               (click)="onTrackClick($event)">
             
             <!-- Ticks with Labels -->
             <div class="absolute inset-x-0 bottom-[-28px] flex justify-between pointer-events-none px-1">
                 <div *ngFor="let tick of ticks; let i = index" class="flex flex-col items-center">
                    <div class="h-1.5 w-[1.5px] bg-gray-600/50 mb-1.5"></div>
                    <!-- Sample dynamic labels for look (Simplified) -->
                    <span *ngIf="i % 4 === 0" class="text-[10px] text-gray-500 font-bold whitespace-nowrap">
                       {{ i === 0 ? 'Start' : (i === 8 ? '7. Jan.' : '') }}
                    </span>
                 </div>
             </div>

             <!-- Handle (Circular now) -->
             <div #handle class="absolute top-1/2 -translate-y-1/2 w-9 h-9 bg-[#1a1c1e] border-2 rounded-full shadow-2xl cursor-grab active:cursor-grabbing flex items-center justify-center text-white z-10 outline-none focus:ring-4 focus:ring-[#4ade80]/20"
                  [class.border-[#4ade80]]="isActive"
                  [class.border-gray-500]="!isActive"
                  [style.left]="'calc(' + progress + '% - ' + (progress * 0.36) + 'px)'"
                  style="transform: translateY(-50%); transition: none;"
                  tabindex="0"
                  (mousedown)="onHandleMouseDown($event)">
                  <!-- Icon: <> -->
                  <svg class="w-4 h-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M8 9l-3 3 3 3m8-6l3 3-3 3"></path></svg>
             </div>
          </div>
       </div>
    </div>
  `
})
export class MapTimelineComponent implements OnInit {
  config = input<TimelineConfig>(DEFAULT_TIMELINE_CONFIG);

  @Output() dateChange = new EventEmitter<Date>();
  @ViewChild('track') trackRef!: ElementRef<HTMLElement>;
  @ViewChild('handle') handleRef!: ElementRef<HTMLElement>;

  showRangeMenu = false;
  showIntervalMenu = false;

  timelineDate = new Date();
  progress = 100; // Percentage 0-100
  isDragging = false;
  isActive = false; // Simple switch for green border and interaction focus

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

  ticks = new Array(48);

  constructor(private router: Router) {
    effect(() => {
      // React to config changes
      const currentConfig = this.config();
      this.progress = 100;
      this.timelineDate = new Date();
    });
  }

  ngOnInit() { }

  toggleRangeMenu() { this.showRangeMenu = !this.showRangeMenu; this.showIntervalMenu = false; }
  toggleIntervalMenu() { this.showIntervalMenu = !this.showIntervalMenu; this.showRangeMenu = false; }

  getLabelForRange(val: string) { return this.rangeOptions.find(o => o.value === val)?.label || val; }
  getLabelForInterval(val: string) { return this.intervalOptions.find(o => o.value === val)?.label || val; }

  getAvailableIntervals() {
    const currentRangeOpt = this.rangeOptions.find(r => r.value === this.config().range);
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
    this.navigate(this.config().range, interval);
    this.showIntervalMenu = false;
  }

  navigate(range: string, interval: string) {
    this.router.navigate(['map', range, interval]);
  }

  // --- Slider Interaction ---

  onTrackClick(e: MouseEvent) {
    if (this.isDragging) return;
    this.isActive = true;
    this.updateProgressFromEvent(e);
  }

  onHandleMouseDown(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.isDragging = true;
    this.isActive = true;
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;
    this.updateProgressFromEvent(e);
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
    // isActive stays true as requested until deactivated elsewhere
  }

  @HostListener('document:mousedown', ['$event'])
  onDocumentMouseDown(e: MouseEvent) {
    // If we click outside the component (track and handle), deactivate
    const target = e.target as HTMLElement;
    const clickedInside = this.trackRef?.nativeElement.contains(target) ||
      this.handleRef?.nativeElement.contains(target);

    if (!clickedInside) {
      this.isActive = false;
    }
  }

  @HostListener('document:keydown', ['$event'])
  onDocumentKeyDown(e: KeyboardEvent) {
    if (!this.isActive) return;

    // Support navigation via document-level listener
    const step = e.shiftKey ? 10 : 2;
    if (e.key === 'ArrowLeft') {
      this.progress = Math.max(0, this.progress - step);
      this.emitChange();
    } else if (e.key === 'ArrowRight') {
      this.progress = Math.min(100, this.progress + step);
      this.emitChange();
    } else if (e.key === 'Escape') {
      this.isActive = false;
    }
  }

  private updateProgressFromEvent(e: MouseEvent) {
    if (!this.trackRef) return;

    const rect = this.trackRef.nativeElement.getBoundingClientRect();
    const relX = e.clientX - rect.left;

    let pct = (relX / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));

    this.progress = pct;
    this.emitChange();
  }

  private emitChange() {
    this.dateChange.emit(new Date());
  }
}
