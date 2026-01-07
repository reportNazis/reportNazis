import { Injectable, computed, signal, inject } from '@angular/core';
import { LayerSourceConfig } from '../models/layer.types';
import { LAYER_CONFIG } from '../config/map/layer.config';

@Injectable({
    providedIn: 'root'
})
export class LayerService {
    private readonly config = inject(LAYER_CONFIG);

    // -- State Signals --
    private readonly _activeDataSourceId = signal<string>('right_wing_events'); // Default to right wing events
    private readonly _activeDataSourceType = signal<string>('rechts'); // Default to right wing events
    private readonly _activePoliticalSpectrumLayers = signal<Set<string>>(new Set(['rechts']));

    // -- Computed Selectors --

    // Get the full config object for the active data source
    readonly activeDataSource = computed(() =>
        this.config.find(c => c.id === this._activeDataSourceId())
        // Fallback if not found (shouldn't happen with correct config)
        || this.config.find(c => c.type === 'data-source')!
    );

    readonly activeDataSourceType = computed(() =>
        this._activeDataSourceType()
    );

    readonly politicalSpectrum = computed(() => {
        const activeIds = this._activePoliticalSpectrumLayers();
        return this.config
            .filter(c => c.type === 'political_spectrum')
            .map(layer => ({
                ...layer,
                active: activeIds.has(layer.id)
            }));
    });


    readonly availableDataSources = computed(() =>
        this.config.filter(c => c.type === 'data-source' && c.dataSourceType === this._activeDataSourceType())
    );

    // -- Actions --

    setDataSource(id: string) {
        const source = this.config.find(c => c.id === id && c.type === 'data-source');
        if (source) {
            this._activeDataSourceId.set(id);
        } else {
            console.warn(`LayerService: Attempted to set unknown data source '${id}'`);
        }
    }

    togglePoliticalSpectrumLayer(id: string) {
        const layer = this.config.find(c => c.id === id && c.type === 'political_spectrum');
        if (!layer) {
            console.warn(`LayerService: Attempted to toggle unknown political spectrum layer '${id}'`);
            return;
        }
        else {
            // Update Type
            this._activeDataSourceType.set(layer.dataSourceType!);

            // Switch active data source to the first available one for this type
            const defaultSource = this.config.find(c =>
                c.type === 'data-source' && c.dataSourceType === layer.dataSourceType
            );
            if (defaultSource) {
                this._activeDataSourceId.set(defaultSource.id);
            }
        }

        this._activePoliticalSpectrumLayers.update(current => {
            const newSet = new Set<string>();
            if (!current.has(id)) {
                newSet.add(id);
            }

            return newSet;
        });
    }

    isPoliticalSpectrumLayerActive(id: string): boolean {
        return this._activePoliticalSpectrumLayers().has(id);
    }
}
