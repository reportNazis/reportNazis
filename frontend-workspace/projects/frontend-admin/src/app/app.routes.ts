import { Routes } from '@angular/router';
import { environment } from '../environments/environment';

export const routes: Routes = [
    { path: '', redirectTo: environment.bypassLogin ? 'dashboard' : 'login', pathMatch: 'full' },
    { path: 'login', loadComponent: () => import('./login/login.component').then(m => m.LoginComponent) },
    { path: 'dashboard', loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent) },
    { path: 'invite-generator', loadComponent: () => import('./invite-generator/invite-generator.component').then(m => m.InviteGeneratorComponent) },
    { path: 'profile', loadComponent: () => import('./profile/profile.component').then(m => m.ProfileComponent) },
    { path: '**', redirectTo: 'login' }
];
