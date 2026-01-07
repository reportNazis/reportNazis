import { Observable } from 'rxjs';

export type LayerType = 'data-source' | 'weather';

export interface LayerSourceConfig {
    id: string;
    label: string;
    icon?: string; // URL or icon name
    type: LayerType;
    description?: string;
}

export interface IMapDataSource {
    readonly id: string;
    /**
     * Connects the data source to the map interactions/time.
     * Returns an observable of the data to render (could be colors, values, etc).
     */
    connect(): Observable<any>;

    /**
     * cleanup when switching away
     */
    disconnect(): void;
}
