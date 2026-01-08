import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild, ChangeDetectionStrategy, NgZone, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import maplibregl from 'maplibre-gl';
import { MapControlService } from '../../../services/map-control.service';
import { MapRenderingService } from '../../../features/map/services/map-rendering.service';
import { Subscription } from 'rxjs';
import { effect } from '@angular/core';

@Component({
  selector: 'app-map-canvas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-canvas.html',
  styleUrl: './map-canvas.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private map: maplibregl.Map | undefined;
  private mapControlService = inject(MapControlService);
  private mapRenderingService = inject(MapRenderingService);
  private zoomSubscription: Subscription | undefined;

  constructor(private ngZone: NgZone) {
    // React to overlay changes
    // effect(() => {
    //   const overlay = this.mapRenderingService.activeOverlay();
    //   if (overlay.svg && overlay.bounds && this.map) {
    //     this.updateOverlay(overlay.svg, overlay.bounds);
    //   }
    // });
  }

  ngAfterViewInit(): void {
    this.initMap();

    // Subscribe to zoom actions
    this.zoomSubscription = this.mapControlService.zoomActions$.subscribe(action => {
      if (!this.map) return;

      this.ngZone.runOutsideAngular(() => {
        const currentZoom = this.map!.getZoom();
        if (action === 'in') {
          this.map!.zoomTo(currentZoom + 1);
        } else {
          this.map!.zoomTo(currentZoom - 1);
        }
      });
    });
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
    this.zoomSubscription?.unsubscribe();
  }

  private initMap(): void {
    // Run map initialization outside Angular zone to avoid excessive change detection cycles
    this.ngZone.runOutsideAngular(() => {
      this.map = new maplibregl.Map({
        container: 'map', // matches id in html
        style: {
          version: 8,
          sources: {
            'osm': {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
              maxzoom: 19
            }
          },
          layers: [
            {
              id: 'osm',
              type: 'raster',
              source: 'osm'
            }
          ]
        },
        center: [11.5820, 48.1351], // Munich Center
        zoom: 11,
        attributionControl: false,
        // Epic 2: Advanced Navigation Mechanics
        scrollZoom: true,
        dragPan: true,
        boxZoom: true,
        keyboard: true,
        doubleClickZoom: true,
        touchZoomRotate: true
      });

      this.map.on('load', () => {
        console.log('Map loaded successfully');
        // Check if we already have an overlay to render (if signal was set before map load)
        // const overlay = this.mapRenderingService.activeOverlay();
        // if (overlay.svg && overlay.bounds) {
        //   this.updateOverlay(overlay.svg, overlay.bounds);
        // }
      });

      this.map.on('move', () => {
        console.log(`MapMove: Center ${this.map?.getCenter()}, Zoom ${this.map?.getZoom()}`);
      });

      this.map.on('zoom', () => {
        console.log(`MapZoom: ${this.map?.getZoom()}`);
      });
    });
  }

  private updateOverlay(svgContent: string, bounds: [number, number, number, number]) {
    this.ngZone.runOutsideAngular(() => {
      if (!this.map || !this.map.loaded()) return;

      const sourceId = 'custom-overlay-source';
      const layerId = 'custom-overlay-layer';

      // Remove existing layer/source if present
      if (this.map.getLayer(layerId)) this.map.removeLayer(layerId);
      if (this.map.getSource(sourceId)) this.map.removeSource(sourceId);

      // Convert SVG to Base64 Data URL
      const base64Svg = btoa(unescape(encodeURIComponent(svgContent)));
      const imageUrl = `data:image/svg+xml;base64,${base64Svg}`;

      this.map.addSource(sourceId, {
        type: 'image',
        url: imageUrl,
        coordinates: [
          [bounds[0], bounds[3]], // Top Left (Lng, Lat)
          [bounds[2], bounds[3]], // Top Right
          [bounds[2], bounds[1]], // Bottom Right
          [bounds[0], bounds[1]]  // Bottom Left
        ]
      });

      this.map.addLayer({
        id: layerId,
        type: 'raster',
        source: sourceId,
        paint: {
          'raster-fade-duration': 0
        }
      });

      // Fit bounds to the new overlay
      this.map.fitBounds(bounds, { padding: 20 });
    });
  }
}
