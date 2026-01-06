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
        const body = new URLSearchParams();
        body.set('grant_type', 'password');
        body.set('client_id', this.settings.client_id || '');
        body.set('username', username);
        body.set('password', password);
        body.set('scope', this.settings.scope || 'openid profile email');

        // We assume the gateway proxies /auth requests to Zitadel
        const tokenEndpoint = '/auth/oauth/v2/token';

        const headers = new HttpHeaders({
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        return this.http.post(tokenEndpoint, body.toString(), { headers }).pipe(
            map((response: any) => {
                // Manually construct a User object or similar if we want to integrate with oidc-client-ts
                // For now, let's just update the subject with a partial user or handle it
                // Ideally we would use User.fromStorageString or similar but we are just getting raw tokens.

                // Let's create a minimal User-like object to satisfy the app state
                const user = {
                    access_token: response.access_token,
                    id_token: response.id_token,
                    profile: { sub: 'manual_login', name: username }, // We would need to parse ID token for real details
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
