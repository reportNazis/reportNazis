import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient, private auth: AuthService) { }

    private getHeaders(): HttpHeaders {
        const token = this.auth.getAccessToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    get<T>(url: string): Observable<T> {
        return this.http.get<T>(url, { headers: this.getHeaders() });
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.http.post<T>(url, body, { headers: this.getHeaders() });
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.http.put<T>(url, body, { headers: this.getHeaders() });
    }

    delete<T>(url: string): Observable<T> {
        return this.http.delete<T>(url, { headers: this.getHeaders() });
    }
}
