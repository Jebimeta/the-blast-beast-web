import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import {
  convertToParamMap,
  type ActivatedRouteSnapshot,
  type RouterStateSnapshot,
} from '@angular/router';
import { firstValueFrom, type Observable } from 'rxjs';
import { API_BASE_URL } from '../../core/api/api-base-url';
import type { ArticlePage } from '../../core/api/article.models';
import { articleListResolver, type ArticleListData } from './article.resolvers';

const API = 'https://api.theblastbeast.test';

const emptyPage: ArticlePage = {
  content: [],
  page: 0,
  size: 9,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

function route(slug: string, page?: string): ActivatedRouteSnapshot {
  return {
    paramMap: convertToParamMap({ slug }),
    queryParamMap: convertToParamMap(page ? { page } : {}),
  } as ActivatedRouteSnapshot;
}

describe('articleListResolver', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: API },
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('filtra Noticias por la etiqueta homónima, no por categoría', async () => {
    const result = firstValueFrom(
      TestBed.runInInjectionContext(() =>
        articleListResolver(route('noticias'), {} as RouterStateSnapshot),
      ) as Observable<ArticleListData>,
    );

    const articles = http.expectOne(
      (request) => request.url === `${API}/api/v1/articles`,
    );
    expect(articles.request.params.get('tag')).toBe('noticias');
    expect(articles.request.params.has('category')).toBe(false);
    expect(articles.request.params.get('page')).toBe('0');
    expect(articles.request.params.get('size')).toBe('9');
    articles.flush(emptyPage);

    http
      .expectOne(`${API}/api/v1/categories`)
      .flush([{ id: 1, slug: 'noticias', name: 'Noticias', articleCount: 1 }]);

    const data = await result;
    expect(data.category?.slug).toBe('noticias');
  });

  it('mantiene el filtro por categoría en el resto de secciones', async () => {
    const result = firstValueFrom(
      TestBed.runInInjectionContext(() =>
        articleListResolver(
          route('conciertos', '2'),
          {} as RouterStateSnapshot,
        ),
      ) as Observable<ArticleListData>,
    );

    const articles = http.expectOne(
      (request) => request.url === `${API}/api/v1/articles`,
    );
    expect(articles.request.params.get('category')).toBe('conciertos');
    expect(articles.request.params.has('tag')).toBe(false);
    expect(articles.request.params.get('page')).toBe('2');
    articles.flush({ ...emptyPage, page: 2 });

    http
      .expectOne(`${API}/api/v1/categories`)
      .flush([
        { id: 2, slug: 'conciertos', name: 'Conciertos', articleCount: 3 },
      ]);

    const data = await result;
    expect(data.category?.slug).toBe('conciertos');
    expect(data.page.page).toBe(2);
  });
});
