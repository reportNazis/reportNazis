export interface TimelineConfig {
    range: string;   // e.g. 'live', '24h', '30d'
    interval: string; // e.g. '15m', '1h', '1d'
}

export const DEFAULT_TIMELINE_CONFIG: TimelineConfig = {
    range: 'live',
    interval: '15m'
};
