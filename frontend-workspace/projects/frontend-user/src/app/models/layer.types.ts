import { Observable } from 'rxjs';

export type LayerType = 'data-source' | 'political_spectrum';
export type DataSourceType = 'links' | 'rechts';

export interface LegendData {
    title: string;
    unit: string;
    colorTheme: 'pollution' | 'price' | 'renewable' | 'political';
    breakpoints: string[];
}

export interface LayerSourceConfig {
    id: string;
    label: string;
    icon?: string; // URL or icon name
    hexColor?: string;
    type: LayerType;
    dataSourceType?: DataSourceType;
    description?: string;
    legend: LegendData;
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
