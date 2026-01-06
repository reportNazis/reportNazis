import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

export interface InviteResponse {
    code: string;
}

export interface RedeemResponse {
    status: string;
    user_email: string;
}

@Injectable({
    providedIn: 'root'
})
export class ManagementService {
    private apiUrl = '/api/mgmt';

    constructor(private http: HttpClient) { }

    createInvite(email: string): Observable<InviteResponse> {
        return this.http.post<InviteResponse>(`${this.apiUrl}/invites/`, { email });
    }

    redeemInvite(code: string, email: string): Observable<RedeemResponse> {
        const payload = { code, email };
        return this.http.post<RedeemResponse>(`${this.apiUrl}/invites/redeem/`, payload);
    }

    updatePassword(password: string, newPassword: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/me/password`, { password, newPassword });
    }

    updateEmail(email: string): Observable<any> {
        return this.http.post(`${this.apiUrl}/me/email`, { email });
    }
}
