import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class MapAnimationsService {

    constructor() { }

    highlightZip(zip: string, containerSelector: string = '.svg-container') {
        const svgContainer = document.querySelector(containerSelector);
        if (svgContainer) {
            // Clear previous highlights
            this.clearHighlight(containerSelector);

            const target = svgContainer.querySelector(`#zip-${zip}`);
            if (target) {
                target.classList.add('active-search');
                // Future: Add JS-based zoom/pan animation here if needed
            }
        }
    }

    clearHighlight(containerSelector: string = '.svg-container') {
        const svgContainer = document.querySelector(containerSelector);
        if (svgContainer) {
            const oldActive = svgContainer.querySelectorAll('.active-search');
            oldActive.forEach(el => el.classList.remove('active-search'));
        }
    }
}
