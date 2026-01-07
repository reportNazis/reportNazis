import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { SIDEBAR_CONFIG, DEFAULT_SIDEBAR_CONFIG } from './app/shared/components/layout/sidebar/sidebar.config';
import { LAYER_CONFIG, DEFAULT_LAYER_CONFIG } from './app/config/layer.config';

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(routes),
    { provide: SIDEBAR_CONFIG, useValue: DEFAULT_SIDEBAR_CONFIG },
    { provide: LAYER_CONFIG, useValue: DEFAULT_LAYER_CONFIG }
  ]
}).catch(err => console.error(err));
