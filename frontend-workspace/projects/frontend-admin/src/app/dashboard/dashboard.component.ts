import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementService, InviteResponse } from '../../../../shared-lib/src/lib/services/management.service';
import { ZitadelService, ZitadelUser } from '../../../../shared-lib/src/lib/services/zitadel.service';

import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    users: ZitadelUser[] = [];
    newInviteCode: string | null = null;
    error: string = '';

    constructor(
        private managementService: ManagementService,
        private zitadelService: ZitadelService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadUsers();
    }

    loadUsers() {
        this.zitadelService.listUsers().subscribe({
            next: (users: ZitadelUser[]) => this.users = users,
            error: (err: unknown) => {
                console.error('Failed to load users', err);
                this.error = 'Failed to load users.';
            }
        });
    }

    generateInvite() {
        this.router.navigate(['/invite-generator']);
        /* Deprecated inline generation
        this.managementService.createInvite().subscribe({
            next: (res: InviteResponse) => {
                this.newInviteCode = res.code;
            },
            error: (err: unknown) => {
                console.error('Failed to create invite', err);
                this.error = 'Failed to create invite.';
            }
        });
        */
    }
}
