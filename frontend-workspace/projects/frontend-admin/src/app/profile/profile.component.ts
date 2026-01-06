import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManagementService } from '../../../../shared-lib/src/lib/services/management.service';

@Component({
    selector: 'app-profile',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
    passwordForm: FormGroup;
    emailForm: FormGroup;

    isPasswordSubmitting = false;
    passwordMessage = '';
    passwordError = false;

    isEmailSubmitting = false;
    emailMessage = '';
    emailError = false;

    constructor(
        private fb: FormBuilder,
        private managementService: ManagementService
    ) {
        this.passwordForm = this.fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', [Validators.required, Validators.minLength(8)]]
        });

        this.emailForm = this.fb.group({
            newEmail: ['', [Validators.required, Validators.email]]
        });
    }

    onChangePassword() {
        if (this.passwordForm.valid) {
            this.isPasswordSubmitting = true;
            this.passwordMessage = '';
            this.passwordError = false;

            const { currentPassword, newPassword } = this.passwordForm.value;

            this.managementService.updatePassword(currentPassword, newPassword).subscribe({
                next: () => {
                    this.isPasswordSubmitting = false;
                    this.passwordMessage = 'Password updated successfully.';
                    this.passwordForm.reset();
                },
                error: (err) => {
                    this.isPasswordSubmitting = false;
                    this.passwordMessage = 'Failed to update password. Please check your current password.';
                    this.passwordError = true;
                    console.error(err);
                }
            });
        }
    }

    onChangeEmail() {
        if (this.emailForm.valid) {
            this.isEmailSubmitting = true;
            this.emailMessage = '';
            this.emailError = false;

            const { newEmail } = this.emailForm.value;

            this.managementService.updateEmail(newEmail).subscribe({
                next: () => {
                    this.isEmailSubmitting = false;
                    this.emailMessage = 'Email update initiated. Please check your inbox.'; // Assuming verification might be needed
                    this.emailForm.reset();
                },
                error: (err) => {
                    this.isEmailSubmitting = false;
                    this.emailMessage = 'Failed to update email.';
                    this.emailError = true;
                    console.error(err);
                }
            });
        }
    }
}
