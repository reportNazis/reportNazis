import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ManagementService } from '../../../../shared-lib/src/lib/services/management.service';
import { AuthService } from '../../../../shared-lib/src/lib/auth.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  redeemForm: FormGroup;
  message: string = '';
  error: string = '';

  constructor(
    private fb: FormBuilder,
    private managementService: ManagementService,
    private authService: AuthService,
    private router: Router
  ) {
    this.redeemForm = this.fb.group({
      code: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]]
    });

    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  loginForm: FormGroup;
  loginError: string = '';

  onSubmit() {
    if (this.redeemForm.valid) {
      this.message = 'Redeeming...';
      this.error = '';
      const { code, email } = this.redeemForm.value;

      this.managementService.redeemInvite(code, email).subscribe({
        next: (res) => {
          this.message = `Success! Account created for ${res.user_email}. Please login.`;
          this.redeemForm.reset();
        },
        error: (err) => {
          this.message = '';
          this.error = 'Failed to redeem invite. Code may be invalid.';
          console.error(err);
        }
      });
    }
  }

  onLogin() {
    if (this.loginForm.valid) {
      this.loginError = '';
      const { username, password } = this.loginForm.value;
      this.authService.loginWithCredentials(username, password).subscribe({
        next: () => {
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          console.error('Login failed', err);
          this.loginError = 'Invalid credentials or login failed.';
        }
      })
    }
  }

  login() {
    this.authService.login();
  }
}
