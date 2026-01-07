import { Injectable } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PollutionColorService } from '../../../core/services/pollution-color.service';
import { PollutionData } from '../../../core/services/mock-data.service';

@Injectable({
    providedIn: 'root'
})
export class MapRenderingService {

    constructor(
        private colorService: PollutionColorService,
        private sanitizer: DomSanitizer
    ) { }

    /**
     * Processes the raw SVG string, applying colors based on pollution data.
     * Returns a SafeHtml object ready for binding.
     */
    renderMap(svgString: string, data: PollutionData[]): SafeHtml {
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgString, 'image/svg+xml');

        data.forEach(item => {
            const pathId = `zip-${item.zipCode}`;
            const element = doc.getElementById(pathId);
            if (element) {
                const color = this.colorService.getColor(item.score);
                element.setAttribute('fill', color);
                element.setAttribute('data-zip', item.zipCode);
                // Ensure standard class for styling
                element.classList.add('map-path');
            }
        });

        const serializedSvg = new XMLSerializer().serializeToString(doc.documentElement);
        return this.sanitizer.bypassSecurityTrustHtml(serializedSvg);
    }
}
