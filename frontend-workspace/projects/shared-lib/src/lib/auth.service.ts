import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserManager, User, UserManagerSettings } from 'oidc-client-ts';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    // Placeholder config - usually provided via APP_INITIALIZER or environment
    private settings: UserManagerSettings = {
        authority: 'http://localhost:8080',
        client_id: 'visine-sunflower-client',
        redirect_uri: 'http://localhost:4200/callback',
        post_logout_redirect_uri: 'http://localhost:4200/',
        response_type: 'code',
        scope: 'openid profile email'
    };

    private userManager = new UserManager(this.settings);
    private user$$ = new BehaviorSubject<User | null>(null);

    constructor(private http: HttpClient) {
        this.userManager.getUser().then((user: User | null) => {
            if (user && !user.expired) {
                this.user$$.next(user);
            }
        });
    }

    get user$(): Observable<User | null> {
        return this.user$$.asObservable();
    }

    getAccessToken(): string {
        return this.user$$.value?.access_token || '';
    }

    isLoggedIn(): boolean {
        return !!this.user$$.value && !this.user$$.value.expired;
    }

    login(): Promise<void> {
        return this.userManager.signinRedirect();
    }

    loginWithCredentials(username: string, password: string): Observable<any> {
        // Call our backend proxy endpoint which talks to Zitadel Session API
        const loginEndpoint = '/api/mgmt/login/';

        return this.http.post(loginEndpoint, { username, password }).pipe(
            map((response: any) => {
                // Store session info from our backend
                const user = {
                    access_token: response.sessionToken,
                    id_token: response.sessionId,
                    profile: { sub: 'session_login', name: username },
                    expired: false
                } as User;

                this.user$$.next(user);
                return response;
            })
        );
    }

    logout(): Promise<void> {
        return this.userManager.signoutRedirect();
    }

    handleCallback(): Promise<User | null> {
        return this.userManager.signinCallback().then((user: User | undefined) => {
            const safeUser = user || null;
            this.user$$.next(safeUser);
            return safeUser;
        });
    }
}
