import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class PollutionColorService {

    // Electricity Maps inspired scale (Green -> Yellow -> Orange -> Dark Brown -> Black-ish)
    private readonly GRADIENT = [
        '#469C76', // Level 0: Safe/Low (Green)
        '#EAB308', // Level 1: Moderate (Yellow)
        '#F97316', // Level 2: High (Orange)
        '#7F1D1D', // Level 3: Very High (Dark Red/Brown)
        '#1c1917'  // Level 4: Extreme (Black/Dark Brown)
    ];

    private readonly NO_DATA = '#374151'; // Gray-700

    /**
     * Returns a HEX color code based on the pollution score on a 5-step scale.
     * @param score Pollution score (0-100) or null/undefined
     */
    getColor(score: number | null | undefined): string {
        if (score === null || score === undefined) {
            return this.NO_DATA;
        }

        // Map 0-100 to 0-4 index
        if (score <= 20) return this.GRADIENT[0];
        if (score <= 40) return this.GRADIENT[1];
        if (score <= 60) return this.GRADIENT[2];
        if (score <= 80) return this.GRADIENT[3];
        return this.GRADIENT[4];
    }

    getLegendData() {
        return [
            { label: '0 g', color: this.GRADIENT[0] },
            { label: '', color: this.GRADIENT[1] },
            { label: '600 g', color: this.GRADIENT[2] },
            { label: '', color: this.GRADIENT[3] },
            { label: '1200+ g', color: this.GRADIENT[4] },
        ];
    }

    getGradientColors(): string[] {
        return this.GRADIENT;
    }
}
