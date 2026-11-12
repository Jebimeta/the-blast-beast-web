import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { ArticleSummary } from '../../core/api/article.models';
import { LatestTicker } from './latest-ticker';

function article(id: number): ArticleSummary {
  return {
    id,
    slug: `noticia-${id}`,
    title: `Noticia de prueba ${id}`,
    excerpt: `Entradilla de la noticia ${id}`,
    category: { id: 1, slug: 'noticias', name: 'Noticias' },
    authorName: 'Redacción Blast Beast',
    publishedAt: '2026-11-05T09:47:24Z',
    readingMinutes: 4,
    bands: [{ id: 1, slug: 'metallica', name: 'Metallica' }],
    tags: [{ id: 1, slug: 'giras', name: 'Giras' }],
  };
}

describe('LatestTicker', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LatestTicker],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('duplica las noticias para el bucle y permite pausar el movimiento', () => {
    const fixture = TestBed.createComponent(LatestTicker);
    fixture.componentRef.setInput(
      'articles',
      [1, 2, 3, 4, 5].map((id) => article(id)),
    );
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('a')).toHaveLength(10);
    expect(
      element.querySelectorAll('ul[aria-hidden="true"] a[tabindex="-1"]'),
    ).toHaveLength(5);

    const button = element.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-pressed')).toBe('false');

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-pressed')).toBe('true');
    expect(button.getAttribute('aria-label')).toContain('Reanudar');
  });
});
