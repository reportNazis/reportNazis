import { Component, input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PollutionColorService } from '../../../../core/services/pollution-color.service';
import { LegendData } from '../../../../models/layer.types';

@Component({
   selector: 'app-map-legend',
   standalone: true,
   imports: [CommonModule],
   template: `
    <div class="absolute bottom-6 right-6 z-20 flex flex-col items-end space-y-2">
       <div class="bg-gray-800/90 border border-gray-700 rounded-xl px-4 py-3 shadow-xl backdrop-blur-md">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-bold text-white tracking-wide">{{ config().title }}</span>
            <span class="text-xs text-gray-400 font-mono">{{ config().unit }}</span>
          </div>
          
          <!-- Gradient Bar -->
          <div class="w-64 h-2 rounded-full mb-1" 
               [style.background]="gradientStyle">
          </div>

          <!-- Labels -->
          <div class="w-64 flex justify-between text-[10px] text-gray-400 font-mono font-medium">
             <span *ngFor="let label of config().breakpoints">{{ label }}</span>
          </div>
       </div>
    </div>
  `
})
export class MapLegendComponent implements OnInit {
   config = input.required<LegendData>();

   gradientStyle = '';

   constructor(private colorService: PollutionColorService) { }

   ngOnInit(): void {
      const colors = this.colorService.getGradientColors();
      this.gradientStyle = `linear-gradient(to right, ${colors.join(', ')})`;
   }
}

