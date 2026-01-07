import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { IMapDataSource } from '../../models/layer.types';

@Injectable({ providedIn: 'root' })
export class Co2DataSource implements IMapDataSource {
    readonly id = 'co2';

    connect(): Observable<any> {
        // Return mock CO2 data (e.g., color scale or values)
        return of({
            type: 'co2',
            scale: 'linear',
            min: 0,
            max: 800,
            unit: 'test',
            colorScheme: 'carbon' // mapped in component
        });
    }

    disconnect(): void {
        console.log('CO2 Source disconnected');
    }
}

@Injectable({ providedIn: 'root' })
export class PriceDataSource implements IMapDataSource {
    readonly id = 'price';

    connect(): Observable<any> {
        return of({
            type: 'price',
            scale: 'linear',
            min: 0,
            max: 200,
            unit: 'EUR/MWh',
            colorScheme: 'magma'
        });
    }

    disconnect(): void {
        console.log('Price Source disconnected');
    }
}

@Injectable({ providedIn: 'root' })
export class RenewableDataSource implements IMapDataSource {
    readonly id = 'renewable';

    connect(): Observable<any> {
        return of({
            type: 'renewable',
            scale: 'percentage',
            min: 0,
            max: 100,
            unit: '%',
            colorScheme: 'viridis'
        });
    }

    disconnect(): void {
        console.log('Renewable Source disconnected');
    }
}
