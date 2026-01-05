import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApiService } from './api.service';
import { AuthService } from './auth.service';

describe('ApiService', () => {
    let service: ApiService;
    let httpMock: HttpTestingController;
    let authSpy: jasmine.SpyObj<AuthService>;

    beforeEach(() => {
        authSpy = jasmine.createSpyObj('AuthService', ['getAccessToken']);
        authSpy.getAccessToken.and.returnValue('mock-token');

        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ApiService,
                { provide: AuthService, useValue: authSpy }
            ]
        });
        service = TestBed.inject(ApiService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add Authorization header', () => {
        service.get('/test').subscribe();
        const req = httpMock.expectOne('/test');
        expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
        req.flush({});
    });
});
