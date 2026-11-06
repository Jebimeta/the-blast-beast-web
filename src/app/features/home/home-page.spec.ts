import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('muestra la API como operativa cuando responde', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    const request = http.expectOne('/api/v1/ping');
    expect(request.request.method).toBe('GET');

    request.flush({
      status: 'UP',
      app: 'the-blast-beast-api',
      version: '0.1.0-SNAPSHOT',
      timestamp: '2026-11-06T12:00:00Z',
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('API operativa');
    expect(fixture.nativeElement.textContent).toContain('0.1.0-SNAPSHOT');
  });

  it('avisa cuando la API no responde', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    http
      .expectOne('/api/v1/ping')
      .flush('caído', { status: 503, statusText: 'Service Unavailable' });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Sin conexión con la API');
  });
});
