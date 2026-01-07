import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalConfig {
    width?: string;
    closeOnBackdropClick?: boolean;
}

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div *ngIf="isVisible" class="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none animate-fadeIn">
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        (click)="handleBackdropClick()">
      </div>

      <!-- Modal Content -->
      <div 
        class="relative mx-auto my-6 z-50 w-full animate-scaleIn"
        [style.max-width]="config.width || '32rem'">
        <div class="border-0 rounded-2xl shadow-2xl relative flex flex-col w-full bg-gray-800 border border-gray-700 outline-none focus:outline-none overflow-hidden">
          
          <!-- Header -->
          <div class="flex items-center justify-between p-5 border-b border-gray-700">
            <h3 class="text-xl font-bold text-white">
              {{ title }}
            </h3>
            <button 
              class="p-2 ml-auto text-gray-400 hover:text-white bg-transparent hover:bg-white/5 rounded-full transition-colors outline-none focus:outline-none" 
              (click)="close.emit()">
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="relative p-6 flex-auto text-gray-300">
            <ng-content></ng-content>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
    @Input() isVisible = false;
    @Input() title = 'Modal';
    @Input() config: ModalConfig = {
        width: '32rem',
        closeOnBackdropClick: true
    };

    @Output() close = new EventEmitter<void>();

    handleBackdropClick() {
        if (this.config.closeOnBackdropClick !== false) {
            this.close.emit();
        }
    }
}
