import { Injectable } from '@angular/core';
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

    constructor() {
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
