import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ManagementService } from './management.service';

describe('ManagementService', () => {
    let service: ManagementService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ManagementService]
        });
        service = TestBed.inject(ManagementService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createInvite should POST to /api/mgmt/invites/', () => {
        const mockResponse = { code: 'TEST-CODE-123' };

        service.createInvite().subscribe(response => {
            expect(response.code).toBe('TEST-CODE-123');
        });

        const req = httpMock.expectOne('/api/mgmt/invites/');
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('redeemInvite should POST to /api/mgmt/invites/redeem/', () => {
        const mockResponse = { status: 'redeemed', user_email: 'test@example.com' };
        const code = 'TEST-CODE';
        const email = 'test@example.com';

        service.redeemInvite(code, email).subscribe(response => {
            expect(response.status).toBe('redeemed');
            expect(response.user_email).toBe('test@example.com');
        });

        const req = httpMock.expectOne('/api/mgmt/invites/redeem/');
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual({ code, email });
        req.flush(mockResponse);
    });
});
