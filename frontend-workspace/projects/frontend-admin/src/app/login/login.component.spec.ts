import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { ManagementService } from '../../../../shared-lib/src/lib/services/management.service';
import { AuthService } from '../../../../shared-lib/src/lib/auth.service';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockManagementService: any;
  let mockAuthService: any;
  let mockRouter: any;

  beforeEach(async () => {
    mockManagementService = {
      redeemInvite: jasmine.createSpy('redeemInvite').and.returnValue(of({ status: 'redeemed', user_email: 'test@example.com' }))
    };

    mockAuthService = {
      login: jasmine.createSpy('login')
    };

    mockRouter = {
      navigate: jasmine.createSpy('navigate')
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [
        { provide: ManagementService, useValue: mockManagementService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have a form with code and email', () => {
    expect(component.redeemForm.contains('code')).toBeTruthy();
    expect(component.redeemForm.contains('email')).toBeTruthy();
  });

  it('should call redeemInvite on valid form submission', () => {
    component.redeemForm.controls['code'].setValue('TEST-CODE');
    component.redeemForm.controls['email'].setValue('test@example.com');

    component.onSubmit();

    expect(mockManagementService.redeemInvite).toHaveBeenCalledWith('TEST-CODE', 'test@example.com');
  });

  it('should call authService.login on login button click', () => {
    component.login();
    expect(mockAuthService.login).toHaveBeenCalled();
  });
});
