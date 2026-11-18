import {
  HttpClient,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthService,
          useValue: {
            accessToken: () => 'token-de-prueba',
            refresh: () => of(null),
          },
        },
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('añade Bearer a los endpoints autenticados como /api/v1/auth/password', () => {
    http.post('/api/v1/auth/password', {}).subscribe();

    const request = httpMock.expectOne('/api/v1/auth/password');
    expect(request.request.headers.get('Authorization')).toBe(
      'Bearer token-de-prueba',
    );
    request.flush(null);
  });

  it('no añade Bearer al login', () => {
    http.post('/api/v1/auth/login', {}).subscribe();

    const request = httpMock.expectOne('/api/v1/auth/login');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush(null);
  });
});
