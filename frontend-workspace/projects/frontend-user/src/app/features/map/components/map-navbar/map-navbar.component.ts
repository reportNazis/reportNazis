import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
    selector: 'app-map-navbar',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
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
        <!-- Error output handled by parent via error input if needed, or local simple validation -->
      </div>
    </div>
  `
})
export class MapNavbarComponent {
    @Output() search = new EventEmitter<string>();
    @Output() clear = new EventEmitter<void>();

    searchControl = new FormControl('', [Validators.pattern(/^[0-9]{5}$/)]);

    constructor() {
        this.searchControl.valueChanges.subscribe(val => {
            if (this.searchControl.valid && val) {
                this.search.emit(val);
            } else {
                this.clear.emit();
            }
        });
    }
}
