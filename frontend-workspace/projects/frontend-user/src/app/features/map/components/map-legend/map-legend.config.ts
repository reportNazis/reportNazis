export interface LegendConfig {
    title: string;
    unit: string;
    labels: string[];
}

export const DEFAULT_LEGEND_CONFIG: LegendConfig = {
    title: 'Pollution',
    unit: 'AQI',
    labels: ['Low', 'Med', 'High']
};
