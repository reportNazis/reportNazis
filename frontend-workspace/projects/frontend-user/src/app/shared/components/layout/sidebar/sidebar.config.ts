import { InjectionToken } from '@angular/core';

export type SidebarButtonType = 'menu' | 'profile';
export type SidebarButtonPosition = 'top' | 'bottom';

export interface SidebarButton {
    id: string;
    type: SidebarButtonType;
    position: SidebarButtonPosition;
    icon?: string; // SVG path content
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
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />'
        },
        {
            id: 'map',
            type: 'menu',
            position: 'top',
            label: 'Map',
            route: '/map',
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0121 18.382V7.618a1 1 0 01-1.447-.894L15 7m0 13V7" />'
        },
        {
            id: 'data',
            type: 'menu',
            position: 'top',
            label: 'Data',
            route: '/data',
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />'
        },
        {
            id: 'help',
            type: 'menu',
            position: 'bottom',
            label: 'Help',
            route: '/help',
            icon: '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />'
        },
        {
            id: 'profile',
            type: 'profile',
            position: 'bottom',
            label: 'Profile',
            route: '/profile',
            customContent: 'U'
        }
    ]
};
