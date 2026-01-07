import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface PollutionData {
    zipCode: string;
    score: number | null;
}

export interface LocationSearchResult {
    name: string;
    code: string;
    emoji: string;
}

@Injectable({
    providedIn: 'root'
})
export class MockDataService {

    constructor() { }

    /**
     * Returns a simplified SVG map of Munich districts as a string.
     * Note: This is a placeholder SVG. Real implementation would fetch an actual map file.
     */
    getMunichMapData(): Observable<string> {
        const svgContent = `
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
        <!-- 80331: City Center (Altstadt) -->
        <path id="zip-80331" d="M350,250 L450,250 L450,350 L350,350 Z" 
              fill="#e5e7eb" stroke="#374151" stroke-width="2" class="cursor-pointer hover:opacity-80 transition-opacity"/>
        
        <!-- 80469: Isarvorstadt (Below Center) -->
        <path id="zip-80469" d="M350,350 L450,350 L420,450 L380,450 Z" 
              fill="#e5e7eb" stroke="#374151" stroke-width="2" class="cursor-pointer hover:opacity-80 transition-opacity"/>
        
        <!-- 80333: Maxvorstadt (Above Center) -->
        <path id="zip-80333" d="M350,250 L350,180 L450,180 L450,250 Z" 
              fill="#e5e7eb" stroke="#374151" stroke-width="2" class="cursor-pointer hover:opacity-80 transition-opacity"/>
        
        <!-- 80538: Lehel (Right of Center) -->
        <path id="zip-80538" d="M450,250 L520,230 L520,350 L450,350 Z" 
              fill="#e5e7eb" stroke="#374151" stroke-width="2" class="cursor-pointer hover:opacity-80 transition-opacity"/>

         <!-- 80335: Ludwigsvorstadt (Left of Center) -->
        <path id="zip-80335" d="M350,250 L280,280 L280,350 L350,350 Z" 
              fill="#e5e7eb" stroke="#374151" stroke-width="2" class="cursor-pointer hover:opacity-80 transition-opacity"/>
      </svg>
    `;
        return of(svgContent);
    }


    /**
     * Returns mock pollution data.
     */
    getPollutionData(): Observable<PollutionData[]> {
        const data: PollutionData[] = [
            { zipCode: '80331', score: 25 },  // Low
            { zipCode: '80469', score: 55 },  // Medium
            { zipCode: '80333', score: 85 },  // High
            { zipCode: '80538', score: 10 },  // Low
            { zipCode: '80335', score: null } // No Data
        ];
        return of(data);
    }

    /**
     * Simulates fetching data for a specific time range and interval.
     * Returns varying data to demonstrate "time travel".
     */
    getPollutionDataByTime(range: string, interval: string, timestamp?: Date): Observable<PollutionData[]> {
        // Deterministic pseudo-random based on timestamp or just random for now
        // To make it look "alive", we can randomize the scores slightly
        const baseData = [
            { zipCode: '80331', score: 25 },
            { zipCode: '80469', score: 55 },
            { zipCode: '80333', score: 85 },
            { zipCode: '80538', score: 10 },
            { zipCode: '80335', score: null }
        ];

        const adjustedData = baseData.map(item => {
            if (item.score !== null) {
                // Randomize score between -20 and +20 of base, keeping within 0-100
                const change = Math.floor(Math.random() * 41) - 20;
                let newScore = item.score + change;
                newScore = Math.max(0, Math.min(100, newScore));
                return { ...item, score: newScore };
            }
            return item;
        });

        return of(adjustedData);
    }

    /**
     * Searches for countries/regions based on a query string.
     */
    searchLocations(query: string): Observable<LocationSearchResult[]> {
        if (!query.trim()) return of([]);

        const mockLocations: LocationSearchResult[] = [
            { name: 'Vereinigte Arabische Emirate', code: 'AE', emoji: '🇦🇪' },
            { name: 'Afghanistan', code: 'AF', emoji: '🇦🇫' },
            { name: 'Antigua und Barbuda', code: 'AG', emoji: '🇦🇬' },
            { name: 'Angola', code: 'AO', emoji: '🇦🇴' },
            { name: 'Argentinien', code: 'AR', emoji: '🇦🇷' },
            { name: 'Bosnien und Herzegowina', code: 'BA', emoji: '🇧🇦' },
            { name: 'Bangladesch', code: 'BD', emoji: '🇧🇩' },
            { name: 'Belgien', code: 'BE', emoji: '🇧🇪' },
            { name: 'Brasilien', code: 'BR', emoji: '🇧🇷' },
            { name: 'Deutschland', code: 'DE', emoji: '🇩🇪' },
            { name: 'Frankreich', code: 'FR', emoji: '🇫🇷' },
            { name: 'Großbritannien', code: 'GB', emoji: '🇬🇧' },
            { name: 'Italien', code: 'IT', emoji: '🇮🇹' },
            { name: 'Japan', code: 'JP', emoji: '🇯🇵' },
            { name: 'Kanada', code: 'CA', emoji: '🇨🇦' },
            { name: 'Österreich', code: 'AT', emoji: '🇦🇹' },
            { name: 'Schweiz', code: 'CH', emoji: '🇨🇭' },
            { name: 'Spanien', code: 'ES', emoji: '🇪🇸' },
            { name: 'USA', code: 'US', emoji: '🇺🇸' },
        ];

        const filtered = mockLocations.filter(loc =>
            loc.name.toLowerCase().includes(query.toLowerCase()) ||
            loc.code.toLowerCase().includes(query.toLowerCase())
        );

        return of(filtered);
    }
}

