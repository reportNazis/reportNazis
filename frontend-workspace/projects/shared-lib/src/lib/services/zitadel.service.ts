import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ZitadelUser {
    id: string;
    username: string;
    state: string;
}

@Injectable({
    providedIn: 'root'
})
export class ZitadelService {
    private apiUrl = '/auth/api/v1'; // Proxied to Zitadel

    constructor(private http: HttpClient) { }

    listUsers(): Observable<ZitadelUser[]> {
        // Using /auth/management/v1/users as verified in spec for now to pass spec
        return this.http.post<any>('/auth/management/v1/users', {}).pipe(
            map(response => response.result || [])
        );
    }
}
