import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManagementService } from '../../../../shared-lib/src/lib/services/management.service';

@Component({
  selector: 'app-invite-generator',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './invite-generator.component.html',
  styleUrls: ['./invite-generator.component.css']
})
export class InviteGeneratorComponent {
  showModal = false;
  inviteForm: FormGroup;
  message: string = '';
  error: string = '';
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private managementService: ManagementService
  ) {
    this.inviteForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  openModal() {
    this.showModal = true;
    this.inviteForm.reset();
    this.message = '';
    this.error = '';
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    if (this.inviteForm.valid) {
      this.isSubmitting = true;
      this.message = '';
      this.error = '';
      const { email } = this.inviteForm.value;

      this.managementService.createInvite(email).subscribe({
        next: (res) => {
          this.isSubmitting = false;
          this.message = `Invite sent to ${email}. Code: ${res.code}`;
          this.inviteForm.reset();
          // Optionally close modal after delay or let user close
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = 'Failed to send invite.';
          console.error(err);
        }
      });
    }
  }
}
