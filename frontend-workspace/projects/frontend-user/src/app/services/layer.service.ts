import { Injectable, computed, signal, inject } from '@angular/core';
import { LayerSourceConfig } from '../models/layer.types';
import { LAYER_CONFIG } from '../config/layer.config';

@Injectable({
    providedIn: 'root'
})
export class LayerService {
    private readonly config = inject(LAYER_CONFIG);

    // -- State Signals --
    private readonly _activeDataSourceId = signal<string>('co2'); // Default to CO2
    private readonly _activeWeatherLayers = signal<Set<string>>(new Set());

    // -- Computed Selectors --

    // Get the full config object for the active data source
    readonly activeDataSource = computed(() =>
        this.config.find(c => c.id === this._activeDataSourceId())
        // Fallback if not found (shouldn't happen with correct config)
        || this.config.find(c => c.type === 'data-source')!
    );

    readonly weatherLayers = computed(() => {
        const activeIds = this._activeWeatherLayers();
        return this.config
            .filter(c => c.type === 'weather')
            .map(layer => ({
                ...layer,
                active: activeIds.has(layer.id)
            }));
    });

    readonly availableDataSources = this.config.filter(c => c.type === 'data-source');

    // -- Actions --

    setDataSource(id: string) {
        const source = this.config.find(c => c.id === id && c.type === 'data-source');
        if (source) {
            this._activeDataSourceId.set(id);
        } else {
            console.warn(`LayerService: Attempted to set unknown data source '${id}'`);
        }
    }

    toggleWeatherLayer(id: string) {
        const layer = this.config.find(c => c.id === id && c.type === 'weather');
        if (!layer) {
            console.warn(`LayerService: Attempted to toggle unknown weather layer '${id}'`);
            return;
        }

        this._activeWeatherLayers.update(current => {
            const newSet = new Set(current);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }

    isWeatherLayerActive(id: string): boolean {
        return this._activeWeatherLayers().has(id);
    }
}
