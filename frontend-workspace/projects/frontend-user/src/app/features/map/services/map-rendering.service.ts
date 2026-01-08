import { Injectable, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PollutionColorService } from '../../../core/services/pollution-color.service';
import { PollutionData } from '../../../core/services/mock-data.service';

@Injectable({
    providedIn: 'root'
})
export class MapRenderingService {

    // State for Map Canvas Overlay
    activeOverlay = signal<{ svg: string | null, bounds: [number, number, number, number] | null }>({
        svg: null,
        bounds: null
    });

    constructor(
        private colorService: PollutionColorService,
        private sanitizer: DomSanitizer
    ) { }

    setOverlay(svg: string, bounds: [number, number, number, number]) {
        this.activeOverlay.set({ svg, bounds });
    }

    /**
     * Processes the raw SVG string, applying colors based on pollution data.
     * Returns a SafeHtml object ready for binding.
     */
    /**
     * Processes the raw SVG string and returns the serialized string.
     */
    renderMapString(svgString: string, data: PollutionData[]): string {
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

        return new XMLSerializer().serializeToString(doc.documentElement);
    }

    /**
     * Returns SafeHtml for template binding (Legacy/Fallback).
     */
    renderMap(svgString: string, data: PollutionData[]): SafeHtml {
        const serialized = this.renderMapString(svgString, data);
        return this.sanitizer.bypassSecurityTrustHtml(serialized);
    }
}
