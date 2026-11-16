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

  it('incluye los cuatro perfiles sociales con enlaces seguros', () => {
    const fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll(
        'nav[aria-label="Redes sociales"] a',
      ),
    ) as HTMLAnchorElement[];

    expect(links).toHaveLength(4);
    expect(links.map((link) => link.getAttribute('aria-label'))).toEqual([
      'The Blast Beast en Facebook',
      'The Blast Beast en X',
      'The Blast Beast en WhatsApp',
      'The Blast Beast en Instagram',
    ]);

    for (const link of links) {
      expect(link.target).toBe('_blank');
      expect(link.rel).toContain('noopener');
      expect(link.rel).toContain('noreferrer');
      expect(link.querySelector('svg')).toBeTruthy();
    }
  });
});
