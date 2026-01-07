import { Injectable, Inject, isDevMode } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { SIDEBAR_CONFIG, SidebarConfig } from './sidebar.config';

@Injectable({
    providedIn: 'root'
})
export class SidebarService {
    constructor(
        @Inject(SIDEBAR_CONFIG) public config: SidebarConfig,
        private router: Router
    ) {
        this.validateRoutes();
    }

    private validateRoutes(): void {
        const configuredRoutes = this.router.config;
        const flattenedRoutes = this.flattenRoutes(configuredRoutes);

        this.config.buttons.forEach(button => {
            if (button.route) {
                // Simple check: does the route path exist in the flattened routes?
                // Note: This is a basic check and might need refinement for complex nested routes or parameters.
                // It checks if the button.route (e.g. '/home') matches any configured path.
                // We strip the leading slash for comparison as Angular routes are defined without it usually.
                const routePath = button.route.startsWith('/') ? button.route.substring(1) : button.route;

                // We actally need to check if we can navigate to it, but inspecting config is static.
                // Let's check if any route config *starts* with this path or matches.
                // For simplicity in this first pass, we just warn if it looks suspicious.

                const valid = this.checkRouteExists(routePath, configuredRoutes);

                if (!valid) {
                    const message = `Sidebar Configuration Warning: Route '${button.route}' for button '${button.id}' is not defined in the Router configuration.`;
                    if (isDevMode()) {
                        console.warn(message);
                    } else {
                        // In prod we might want to log this to a monitoring service or potentially hide the button
                        // For now, we will just error/warn in console as per requirement "throw a reminder in development mode"
                        console.error(message);
                    }
                }
            }
        });
    }

    private checkRouteExists(path: string, routes: Routes): boolean {
        // This is a naive recursive check.
        for (const route of routes) {
            if (route.path === path) return true;
            if (route.children) {
                if (this.checkRouteExists(path, route.children)) return true;
            }
            // Handle lazy loading if needed, but we can't easily inspect loaded routes. 
            // We assume top level or eager loaded for now for the basic check.
        }
        return false;
    }

    private flattenRoutes(routes: Routes): string[] {
        // Helper if we wanted a flat list, but recursive check is better.
        return [];
    }
}
