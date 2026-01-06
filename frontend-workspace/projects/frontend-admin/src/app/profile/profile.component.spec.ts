import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';

import { ProfileComponent } from './profile.component';
import { ManagementService } from '../../../../shared-lib/src/lib/services/management.service';

describe('ProfileComponent', () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let managementServiceMock: any;

    beforeEach(async () => {
        managementServiceMock = {
            updatePassword: jasmine.createSpy('updatePassword').and.returnValue(of({})),
            updateEmail: jasmine.createSpy('updateEmail').and.returnValue(of({}))
        };

        await TestBed.configureTestingModule({
            imports: [ProfileComponent, ReactiveFormsModule],
            providers: [
                { provide: ManagementService, useValue: managementServiceMock }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call updatePassword on form submission', () => {
        component.passwordForm.setValue({
            currentPassword: 'old-password',
            newPassword: 'new-password-123'
        });
        component.onChangePassword();
        expect(managementServiceMock.updatePassword).toHaveBeenCalledWith('old-password', 'new-password-123');
    });

    it('should call updateEmail on form submission', () => {
        component.emailForm.setValue({
            newEmail: 'new@example.com'
        });
        component.onChangeEmail();
        expect(managementServiceMock.updateEmail).toHaveBeenCalledWith('new@example.com');
    });
});
