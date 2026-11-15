import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ArticleApiService } from '../../core/api/article-api.service';
import type { ArticleSummary } from '../../core/api/article.models';
import { NotFoundPage } from './not-found-page';

const article: ArticleSummary = {
  id: 7,
  slug: 'metallica-anuncia-gira',
  title: 'Metallica anuncia gira europea',
  excerpt: 'Doce fechas.',
  category: { id: 1, slug: 'noticias', name: 'Noticias' },
  authorName: 'Redacción Blast Beast',
  publishedAt: '2026-11-05T09:47:24Z',
  readingMinutes: 4,
  bands: [],
  tags: [],
};

describe('NotFoundPage', () => {
  let navigate: ReturnType<typeof vi.spyOn>;
  let getRandomArticle: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    getRandomArticle = vi.fn().mockReturnValue(of(article));

    await TestBed.configureTestingModule({
      imports: [NotFoundPage],
      providers: [
        provideRouter([]),
        { provide: ArticleApiService, useValue: { getRandomArticle } },
      ],
    }).compileComponents();

    navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
  });

  it('lleva a una noticia aleatoria al pulsar el botón', async () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    const button = (
      Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      ) as HTMLButtonElement[]
    ).find((candidate) =>
      (candidate.textContent ?? '').includes('Sorpréndeme'),
    );
    expect(button).toBeTruthy();

    button?.click();
    await Promise.resolve();
    fixture.detectChanges();

    expect(getRandomArticle).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith([
      '/articulos',
      'metallica-anuncia-gira',
    ]);
  });

  it('muestra un aviso si no hay noticias que sugerir', () => {
    getRandomArticle.mockReturnValue(
      throwError(() => new Error('sin conexión')),
    );

    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    const button = (
      Array.from(
        fixture.nativeElement.querySelectorAll('button'),
      ) as HTMLButtonElement[]
    ).find((candidate) =>
      (candidate.textContent ?? '').includes('Sorpréndeme'),
    );
    button?.click();
    fixture.detectChanges();

    const alert = fixture.nativeElement.querySelector('[role="alert"]');
    expect(alert?.textContent).toContain(
      'No pudimos encontrar una noticia. Prueba con el archivo.',
    );
  });

  it('envía la búsqueda al buscador cuando hay dos caracteres', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '#not-found-q',
    ) as HTMLInputElement;
    input.value = 'Opeth';
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(navigate).toHaveBeenCalledWith(['/buscar'], {
      queryParams: { q: 'Opeth' },
    });
  });

  it('ignora búsquedas demasiado cortas', () => {
    const fixture = TestBed.createComponent(NotFoundPage);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector(
      '#not-found-q',
    ) as HTMLInputElement;
    input.value = 'a';
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));

    expect(navigate).not.toHaveBeenCalled();
  });
});
