import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class MapControlService {
    // Action streams
    private zoomActionSource = new Subject<'in' | 'out'>();
    zoomActions$ = this.zoomActionSource.asObservable();

    zoomIn() {
        this.zoomActionSource.next('in');
    }

    zoomOut() {
        this.zoomActionSource.next('out');
    }
}
