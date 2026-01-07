import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MockDataService, LocationSearchResult } from '../../../../core/services/mock-data.service';
import { debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'app-map-navbar',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="absolute top-6 left-6 z-30 w-[420px]">
      <div class="relative group/search bg-[#1a1c1e]/90 border border-gray-700/30 rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-300 overflow-hidden"
           [class.rounded-b-none]="showResults && (results$ | async)?.length">
        
        <!-- Search Input Wrapper -->
        <div class="flex items-center px-4 py-3 gap-3">
          <div class="flex items-center justify-center">
            <svg class="h-5 w-5 text-gray-400 group-focus-within/search:text-white transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
            </svg>
          </div>
          
          <input 
            [formControl]="searchControl"
            type="text" 
            placeholder="Land oder Region suchen" 
            class="block w-full bg-transparent border-none text-[15px] placeholder-gray-500 text-white focus:outline-none focus:ring-0 shadow-none transition-all"
            (focus)="showResults = true"
          />

          <!-- Clear Button -->
          <button *ngIf="searchControl.value" 
                  (click)="clearSearch()"
                  class="p-1 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <!-- Progress/Loading Indicator (Subtle) -->
        <div *ngIf="isLoading" class="absolute bottom-0 left-0 h-[1.5px] bg-[#4ade80] animate-pulse w-full"></div>
      </div>

      <!-- Results List -->
      <div *ngIf="showResults && (results$ | async) as results" 
           class="bg-[#1a1c1e]/90 border-x border-b border-gray-700/30 rounded-b-2xl shadow-2xl backdrop-blur-xl overflow-y-auto max-h-[400px] absolute w-full left-0 top-full">
        
        <div *ngIf="results.length === 0 && searchControl.value && !isLoading" class="p-6 text-center text-gray-400 text-sm">
           Keine Ergebnisse gefunden
        </div>

        <div *ngFor="let loc of results" 
             (click)="selectResult(loc)"
             class="flex items-center px-5 py-4 gap-4 hover:bg-white/5 cursor-pointer transition-colors border-t border-gray-800/50 first:border-0 group/item">
          <span class="text-xl filter drop-shadow-sm group-hover/item:scale-110 transition-transform">{{ loc.emoji }}</span>
          <span class="text-[15px] font-medium text-gray-200 group-hover/item:text-white transition-colors">{{ loc.name }}</span>
        </div>
      </div>
    </div>
  `
})
export class MapNavbarComponent {
  @Output() search = new EventEmitter<string>();
  @Output() clear = new EventEmitter<void>();

  private mockDataService = inject(MockDataService);
  searchControl = new FormControl('');
  showResults = false;
  isLoading = false;

  results$: Observable<LocationSearchResult[]> = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    tap(() => this.isLoading = true),
    switchMap(val => {
      if (!val || val.length < 2) {
        this.isLoading = false;
        return of([]);
      }
      return this.mockDataService.searchLocations(val).pipe(
        tap(() => this.isLoading = false)
      );
    })
  );

  clearSearch() {
    this.searchControl.setValue('');
    this.showResults = false;
    this.clear.emit();
  }

  selectResult(loc: LocationSearchResult) {
    this.searchControl.setValue(loc.name, { emitEvent: false });
    this.showResults = false;
    this.search.emit(loc.name);
  }
}
