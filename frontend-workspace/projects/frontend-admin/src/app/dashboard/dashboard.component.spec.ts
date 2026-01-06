import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DashboardComponent } from './dashboard.component';
import { ManagementService } from '../../../../shared-lib/src/lib/services/management.service';
import { ZitadelService, ZitadelUser } from '../../../../shared-lib/src/lib/services/zitadel.service';
import { of, throwError } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('DashboardComponent', () => {
    let component: DashboardComponent;
    let fixture: ComponentFixture<DashboardComponent>;
    let mockManagementService: any;
    let mockZitadelService: any;

    beforeEach(async () => {
        mockManagementService = {
            createInvite: jasmine.createSpy('createInvite').and.returnValue(of({ code: 'NEW-INVITE-CODE' }))
        };

        mockZitadelService = {
            listUsers: jasmine.createSpy('listUsers').and.returnValue(of([
                { id: '1', username: 'user1', state: 'active' },
                { id: '2', username: 'user2', state: 'inactive' }
            ] as ZitadelUser[]))
        };

        await TestBed.configureTestingModule({
            imports: [DashboardComponent],
            providers: [
                { provide: ManagementService, useValue: mockManagementService },
                { provide: ZitadelService, useValue: mockZitadelService }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(DashboardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load users on init', () => {
        expect(mockZitadelService.listUsers).toHaveBeenCalled();
        expect(component.users.length).toBe(2);
        expect(component.users[0].username).toBe('user1');
    });

    it('should generate invite code on button click', () => {
        // Simulate button click if button exists, or just call method
        component.generateInvite();
        expect(mockManagementService.createInvite).toHaveBeenCalled();
        expect(component.newInviteCode).toBe('NEW-INVITE-CODE');
    });
});
