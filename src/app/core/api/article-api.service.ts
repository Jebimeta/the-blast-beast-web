import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import type {
  ArticleDetail,
  ArticlePage,
  ArticleQuery,
  ArticleSummary,
  BandDetail,
  CategoryResponse,
} from './article.models';

@Injectable({ providedIn: 'root' })
export class ArticleApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  listArticles(query: ArticleQuery = {}): Observable<ArticlePage> {
    let params = new HttpParams();

    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.size !== undefined) {
      params = params.set('size', query.size);
    }
    if (query.category) {
      params = params.set('category', query.category);
    }
    if (query.tag) {
      params = params.set('tag', query.tag);
    }
    if (query.band) {
      params = params.set('band', query.band);
    }
    if (query.q) {
      params = params.set('q', query.q);
    }
    if (query.sort) {
      params = params.set('sort', query.sort);
    }

    return this.http.get<ArticlePage>(`${this.baseUrl}/api/v1/articles`, { params });
  }

  listFeaturedArticles(): Observable<ArticleSummary[]> {
    return this.http.get<ArticleSummary[]>(
      `${this.baseUrl}/api/v1/articles/featured`,
    );
  }

  getArticle(slug: string): Observable<ArticleDetail> {
    return this.http.get<ArticleDetail>(
      `${this.baseUrl}/api/v1/articles/${encodeURIComponent(slug)}`,
    );
  }

  listCategories(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.baseUrl}/api/v1/categories`);
  }

  getBand(slug: string): Observable<BandDetail> {
    return this.http.get<BandDetail>(
      `${this.baseUrl}/api/v1/bands/${encodeURIComponent(slug)}`,
    );
  }

  searchArticles(q: string, page = 0, size = 12): Observable<ArticlePage> {
    const params = new HttpParams()
      .set('q', q)
      .set('page', page)
      .set('size', size);

    return this.http.get<ArticlePage>(`${this.baseUrl}/api/v1/search`, { params });
  }
}
