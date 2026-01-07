import { InjectionToken } from '@angular/core';

export type SidebarButtonType = 'menu' | 'profile';
export type SidebarButtonPosition = 'top' | 'bottom';

export interface SidebarButton {
    id: string;
    type: SidebarButtonType;
    position: SidebarButtonPosition;
    iconName?: string; // Material Icon name
    label: string; // Tooltip text
    active?: boolean;
    route?: string;
    customContent?: string; // For things like the profile initial
}

export interface SidebarConfig {
    buttons: SidebarButton[];
}

export const SIDEBAR_CONFIG = new InjectionToken<SidebarConfig>('SIDEBAR_CONFIG');

export const DEFAULT_SIDEBAR_CONFIG: SidebarConfig = {
    buttons: [
        {
            id: 'home',
            type: 'menu',
            position: 'top',
            label: 'Home',
            route: '/home',
            iconName: 'home'
        },
        {
            id: 'map',
            type: 'menu',
            position: 'top',
            label: 'Map',
            route: '/map',
            iconName: 'map'
        },
        {
            id: 'datasets',
            type: 'menu',
            position: 'top',
            label: 'Datasets',
            route: '/datasets',
            iconName: 'storage'
        },
        {
            id: 'data-explorer',
            type: 'menu',
            position: 'top',
            label: 'Data Explorer',
            route: '/explorer',
            iconName: 'insights'
        },
        {
            id: 'developer-hub',
            type: 'menu',
            position: 'top',
            label: 'Developer Hub',
            route: '/dev',
            iconName: 'code'
        },
        {
            id: 'coverage',
            type: 'menu',
            position: 'top',
            label: 'Coverage',
            route: '/coverage',
            iconName: 'grid_view'
        },
        {
            id: 'help',
            type: 'menu',
            position: 'bottom',
            label: 'Help & Support',
            route: '/help',
            iconName: 'help_outline'
        },
        {
            id: 'sign-in',
            type: 'profile',
            position: 'bottom',
            label: 'Sign in',
            route: '/login',
            iconName: 'person',
            customContent: 'Sign in'
        }
    ]
};
