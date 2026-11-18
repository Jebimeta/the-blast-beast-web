import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Footer } from './footer';

describe('Footer', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('enlaza la agenda, las páginas legales y el feed', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll(
        'nav[aria-label="Enlaces del pie"] a',
      ),
    ) as HTMLAnchorElement[];

    expect(links.map((link) => link.textContent?.trim())).toEqual([
      'Archivo',
      'Buscar',
      'Agenda',
      'Sobre',
      'Contacto',
      'Privacidad',
      'Aviso legal',
      'RSS',
    ]);

    const hrefs = links.map((link) => link.getAttribute('href'));
    expect(hrefs).toContain('/agenda');
    expect(hrefs).toContain('/privacidad');
    expect(hrefs).toContain('/aviso-legal');
    expect(hrefs).toContain('/feed.xml');
  });

  it('no publica redes sociales mientras no haya perfiles reales', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('nav[aria-label="Redes sociales"]'),
    ).toBeNull();
    expect(
      fixture.nativeElement.querySelectorAll('a[target="_blank"]'),
    ).toHaveLength(0);
  });
});
