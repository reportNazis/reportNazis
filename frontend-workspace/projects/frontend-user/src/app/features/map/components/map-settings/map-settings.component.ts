import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-map-settings',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="absolute top-6 right-6 z-20 flex flex-col items-center space-y-4">
      <!-- Settings Cog -->
       <button (click)="openSettings.emit()" class="w-10 h-10 bg-gray-800/90 hover:bg-gray-700 text-white rounded-lg border border-gray-700 flex items-center justify-center shadow-lg backdrop-blur-sm transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
       </button>

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
    </div>
  `
})
export class MapSettingsComponent {
    @Output() zoomIn = new EventEmitter<void>();
    @Output() zoomOut = new EventEmitter<void>();
    @Output() openSettings = new EventEmitter<void>();
}
