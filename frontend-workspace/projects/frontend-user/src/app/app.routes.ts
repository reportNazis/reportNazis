import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./features/map/munich-map/munich-map.component').then(m => m.MunichMapComponent)
    }
];
