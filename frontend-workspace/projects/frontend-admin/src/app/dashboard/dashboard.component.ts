import { Component, OnInit } from '@angular/core';
import { ModalComponent } from '../shared/components/modal/modal.component';

import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManagementService, InviteResponse } from '../../../../shared-lib/src/lib/services/management.service';
import { ZitadelService, ZitadelUser } from '../../../../shared-lib/src/lib/services/zitadel.service';

import { Router } from '@angular/router';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ModalComponent],
    templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
    users: ZitadelUser[] = [];
    newInviteCode: string | null = null;
    error: string = '';

    // Modal & Form
    isInviteModalVisible = false;
    inviteForm: FormGroup;
    inviteMessage: string = '';
    inviteError: string = '';
    isSubmittingInvite = false;

    constructor(
        private managementService: ManagementService,
        private zitadelService: ZitadelService,
        private router: Router,
        private fb: FormBuilder
    ) {
        this.inviteForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]]
        });
    }

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
        this.isInviteModalVisible = true;
        this.inviteForm.reset();
        this.inviteMessage = '';
        this.inviteError = '';
        this.newInviteCode = null;
    }

    closeInviteModal() {
        this.isInviteModalVisible = false;
    }

    onInviteSubmit() {
        if (this.inviteForm.valid) {
            this.isSubmittingInvite = true;
            this.inviteMessage = '';
            this.inviteError = '';
            const { email } = this.inviteForm.value;

            this.managementService.createInvite(email).subscribe({
                next: (res) => {
                    this.isSubmittingInvite = false;
                    this.inviteMessage = `Invite sent to ${email}. Code: ${res.code}`;
                    this.newInviteCode = res.code;
                    this.inviteForm.reset();
                },
                error: (err) => {
                    this.isSubmittingInvite = false;
                    this.inviteError = 'Failed to send invite.';
                    console.error(err);
                }
            });
        }
    }
}
