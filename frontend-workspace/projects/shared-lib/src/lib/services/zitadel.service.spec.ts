import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ZitadelService } from './zitadel.service';

describe('ZitadelService', () => {
    let service: ZitadelService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ZitadelService]
        });
        service = TestBed.inject(ZitadelService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('listUsers should GET /auth/management/v1/users', () => {
        // Note: Zitadel Management API might differ, adjusting to what we proxied
        // We configured /auth/ -> zitadel:8080.
        // Management API is usually /management/v1/users
        const mockUsers = { result: [{ id: '1', userName: 'admin', state: 'ACTIV' }] };

        service.listUsers().subscribe(users => {
            expect(users.length).toBe(1);
            expect(users[0].username).toBe('admin');
        });

        // We expect the service to call this URL
        const req = httpMock.expectOne('/auth/management/v1/users');
        expect(req.request.method).toBe('POST'); // Zitadel search endpoints often use POST
        req.flush(mockUsers);
    });
});
