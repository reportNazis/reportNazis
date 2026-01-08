import { InjectionToken } from '@angular/core';
import { LayerSourceConfig } from '../../models/layer.types';

export const LAYER_CONFIG = new InjectionToken<LayerSourceConfig[]>('LAYER_CONFIG');

export const DEFAULT_LAYER_CONFIG: LayerSourceConfig[] = [
    // SECTION: Data Sources
    // Source Type: Rechts
    {
        id: 'right_wing_events',
        label: 'Rechte Veranstaltungen',
        icon: 'assets/icons/co2.svg', // Placeholder
        type: 'data-source',
        dataSourceType: 'rechts',
        description: 'Verifizierte Rechte Veranstaltungen',
        legend: {
            title: 'Rechte Veranstaltungen',
            unit: 'Anzahl',
            colorTheme: 'pollution',
            breakpoints: ['Wenig', 'Mittel', 'Viel', 'Sehr viel', 'Extrem']
        }
    },
    {
        id: 'price',
        label: 'Gemeldete rechte Street Art',
        icon: 'assets/icons/price.svg',
        type: 'data-source',
        dataSourceType: 'rechts',
        description: 'Gemeldete rechte Street Art',
        legend: {
            title: 'Street Art Meldezahlen',
            unit: 'Meldungen/Woche',
            colorTheme: 'price',
            breakpoints: ['0', '5', '10', '20', '50+']
        }
    },
    {
        id: 'renewable',
        label: 'Gemeldete AfD-Wahlplakate',
        icon: 'assets/icons/renewable.svg',
        type: 'data-source',
        dataSourceType: 'rechts',
        description: 'Gemeldete AfD-Wahlplakate',
        legend: {
            title: 'Wahlplakate Dichte',
            unit: 'Plakate/km²',
            colorTheme: 'renewable',
            breakpoints: ['Keine', 'Vereinzelt', 'Mäßig', 'Hoch', 'Überflutet']
        }
    },

    // Source Type: Links
    {
        id: 'antifa',
        label: 'Antifa Gegenproteste',
        icon: 'assets/icons/renewable.svg',
        type: 'data-source',
        dataSourceType: 'links',
        description: 'Gemeldete Antifaschistische Gegenproteste',
        legend: {
            title: 'Gegenproteste Dichte',
            unit: 'Proteste/km²',
            colorTheme: 'renewable',
            breakpoints: ['Keine', 'Vereinzelt', 'Mäßig', 'Hoch', 'Überflutet']
        }
    },

    {
        id: 'tbd_links',
        label: 'tbd_links',
        icon: 'assets/icons/renewable.svg',
        type: 'data-source',
        dataSourceType: 'links',
        description: 'Gemeldete AfD-Wahlplakate',
        legend: {
            title: 'Wahlplakate Dichte',
            unit: 'Plakate/km²',
            colorTheme: 'renewable',
            breakpoints: ['Keine', 'Vereinzelt', 'Mäßig', 'Hoch', 'Überflutet']
        }
    },

    {
        id: 'tbd_links',
        label: 'tbd_links',
        icon: 'assets/icons/renewable.svg',
        type: 'data-source',
        dataSourceType: 'links',
        description: 'Gemeldete AfD-Wahlplakate',
        legend: {
            title: 'Wahlplakate Dichte',
            unit: 'Plakate/km²',
            colorTheme: 'renewable',
            breakpoints: ['Keine', 'Vereinzelt', 'Mäßig', 'Hoch', 'Überflutet']
        }
    },

    // SECTION: Political Spectrum

    {
        id: 'links',
        label: 'Links',
        icon: 'assets/icons/sun.svg',
        hexColor: '#FF0000',
        type: 'political_spectrum',
        dataSourceType: 'links',
        description: 'Veranstaltungen der linken Szene',
        legend: {
            title: 'Linke Szene Aktivität',
            unit: 'Index',
            colorTheme: 'political',
            breakpoints: ['Ruhig', 'Präsent', 'Dominierend']
        }
    },

    {
        id: 'rechts',
        label: 'Rechts',
        icon: 'assets/icons/wind.svg',
        hexColor: '#8B5A2B',
        type: 'political_spectrum',
        dataSourceType: 'rechts',
        description: 'Veranstaltungen der rechten SZene',
        legend: {
            title: 'Rechte Szene Aktivität',
            unit: 'Index',
            colorTheme: 'political',
            breakpoints: ['Ruhig', 'Aktiv', 'Alarmierend']
        }
    },

];
