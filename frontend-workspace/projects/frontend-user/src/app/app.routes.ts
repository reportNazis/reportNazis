import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'map/live/15m',
        pathMatch: 'full'
    },
    {
        path: 'map/:range/:interval',
        loadComponent: () => import('./features/map/munich-map/munich-map.component').then(m => m.MunichMapComponent)
    },
    // Fallback for old route or direct access without params if needed, checks redirect in component or redirects here?
    // Let's allow loose matching or redirect everything else to default
    {
        path: '**',
        redirectTo: 'map/live/15m'
    }
];
