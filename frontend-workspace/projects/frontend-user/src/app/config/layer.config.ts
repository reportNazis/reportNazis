import { InjectionToken } from '@angular/core';
import { LayerSourceConfig } from '../models/layer.types';

export const LAYER_CONFIG = new InjectionToken<LayerSourceConfig[]>('LAYER_CONFIG');

export const DEFAULT_LAYER_CONFIG: LayerSourceConfig[] = [
    // SECTION: Data Sources
    {
        id: 'co2',
        label: 'CO₂-Intensität',
        icon: 'assets/icons/co2.svg', // Placeholder
        type: 'data-source',
        description: 'Carbon intensity of electricity consumption'
    },
    {
        id: 'price',
        label: 'Strompreis',
        icon: 'assets/icons/price.svg',
        type: 'data-source',
        description: 'Day-ahead electricity prices'
    },
    {
        id: 'renewable',
        label: 'Erneuerbare Energie',
        icon: 'assets/icons/renewable.svg',
        type: 'data-source',
        description: 'Share of renewable energy'
    },

    // SECTION: Weather
    {
        id: 'wind',
        label: 'Wind',
        icon: 'assets/icons/wind.svg',
        type: 'weather',
        description: 'Wind speed and direction layer'
    },
    {
        id: 'solar',
        label: 'Solar',
        icon: 'assets/icons/sun.svg',
        type: 'weather',
        description: 'Solar irradiance layer'
    }
];
