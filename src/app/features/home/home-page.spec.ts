import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import type { ArticleSummary } from '../../core/api/article.models';
import { HomePage } from './home-page';
import type { HomeData } from './home.resolver';

function article(
  id: number,
  slug: string,
  title: string,
  categoryName = 'Noticias',
): ArticleSummary {
  return {
    id,
    slug,
    title,
    excerpt: `Entradilla de ${title}`,
    category: { id, slug: categoryName.toLowerCase(), name: categoryName },
    authorName: 'Redacción Blast Beast',
    publishedAt: '2026-11-05T09:47:24Z',
    readingMinutes: 4,
    bands: [{ id, slug: 'metallica', name: 'Metallica' }],
    tags: [{ id, slug: 'giras', name: 'Giras' }],
  };
}

const data: HomeData = {
  featured: [
    article(1, 'portada', 'Metallica anuncia gira europea'),
    article(2, 'segunda', 'Judas Priest entra al estudio'),
  ],
  latest: {
    content: [
      article(1, 'portada', 'Metallica anuncia gira europea'),
      article(2, 'segunda', 'Judas Priest entra al estudio'),
    ],
    page: 0,
    size: 6,
    totalElements: 2,
    totalPages: 1,
    first: true,
    last: true,
  },
  categories: [
    { id: 1, slug: 'noticias', name: 'Noticias', articleCount: 2 },
  ],
};

describe('HomePage', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('muestra el artículo de portada y las últimas noticias', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.componentRef.setInput('home', data);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Metallica anuncia gira europea');
    expect(text).toContain('Judas Priest entra al estudio');
    expect(text).toContain('Noticias');
    expect(text).toContain('Leer la noticia');
  });

  it('muestra un estado vacío cuando no hay contenido', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.componentRef.setInput('home', {
      featured: [],
      latest: { ...data.latest, content: [], totalElements: 0, totalPages: 0 },
      categories: [],
    } satisfies HomeData);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Aún no hay noticias');
  });
});
