import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import type {
  AdminArticleDetail,
  AdminArticlePage,
  AdminArticleStatus,
  ArticleCoverUpdateRequest,
  ArticleRevision,
  ArticleWriteRequest,
  BandResponse,
  CategoryAdmin,
  MarkdownPreviewResponse,
  PressContactList,
  ReleaseAdmin,
  ReleaseWriteRequest,
  SocialSummaryResponse,
} from './admin.models';

export interface AdminArticleQuery {
  page?: number;
  size?: number;
  status?: AdminArticleStatus;
  q?: string;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = inject(API_BASE_URL);

  // Artículos ---------------------------------------------------------
  listArticles(query: AdminArticleQuery = {}): Observable<AdminArticlePage> {
    let params = new HttpParams();
    if (query.page !== undefined) {
      params = params.set('page', query.page);
    }
    if (query.size !== undefined) {
      params = params.set('size', query.size);
    }
    if (query.status) {
      params = params.set('status', query.status);
    }
    if (query.q) {
      params = params.set('q', query.q);
    }
    return this.http.get<AdminArticlePage>(`${this.baseUrl}/api/v1/admin/articles`, {
      params,
    });
  }

  getArticle(id: number): Observable<AdminArticleDetail> {
    return this.http.get<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}`,
    );
  }

  createArticle(request: ArticleWriteRequest): Observable<AdminArticleDetail> {
    return this.http.post<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles`,
      request,
    );
  }

  updateArticle(
    id: number,
    request: ArticleWriteRequest,
  ): Observable<AdminArticleDetail> {
    return this.http.put<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}`,
      request,
    );
  }

  deleteArticle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/admin/articles/${id}`);
  }

  uploadArticleCover(
    id: number,
    file: File,
    altText?: string | null,
    credit?: string | null,
  ): Observable<AdminArticleDetail> {
    const form = new FormData();
    form.append('file', file);
    if (altText) {
      form.append('altText', altText);
    }
    if (credit) {
      form.append('credit', credit);
    }
    return this.http.put<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/cover`,
      form,
    );
  }

  updateArticleCover(
    id: number,
    request: ArticleCoverUpdateRequest,
  ): Observable<AdminArticleDetail> {
    return this.http.patch<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/cover`,
      request,
    );
  }

  deleteArticleCover(id: number): Observable<AdminArticleDetail> {
    return this.http.delete<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/cover`,
    );
  }

  publishArticle(id: number): Observable<AdminArticleDetail> {
    return this.http.post<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/publish`,
      {},
    );
  }

  unpublishArticle(id: number): Observable<AdminArticleDetail> {
    return this.http.post<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/unpublish`,
      {},
    );
  }

  archiveArticle(id: number): Observable<AdminArticleDetail> {
    return this.http.post<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/archive`,
      {},
    );
  }

  listRevisions(id: number): Observable<ArticleRevision[]> {
    return this.http.get<ArticleRevision[]>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/revisions`,
    );
  }

  restoreRevision(id: number, revisionId: number): Observable<AdminArticleDetail> {
    return this.http.post<AdminArticleDetail>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/revisions/${revisionId}/restore`,
      {},
    );
  }

  previewMarkdown(bodyMd: string): Observable<MarkdownPreviewResponse> {
    return this.http.post<MarkdownPreviewResponse>(
      `${this.baseUrl}/api/v1/admin/articles/preview`,
      { bodyMd },
    );
  }

  generateSocialSummary(id: number): Observable<SocialSummaryResponse> {
    return this.http.post<SocialSummaryResponse>(
      `${this.baseUrl}/api/v1/admin/articles/${id}/social-summary`,
      {},
    );
  }

  // Categorías --------------------------------------------------------
  listCategories(): Observable<CategoryAdmin[]> {
    return this.http.get<CategoryAdmin[]>(
      `${this.baseUrl}/api/v1/admin/categories`,
    );
  }

  // Bandas ------------------------------------------------------------
  listBands(q = ''): Observable<BandResponse[]> {
    let params = new HttpParams();
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<BandResponse[]>(`${this.baseUrl}/api/v1/admin/bands`, {
      params,
    });
  }

  // Radar de lanzamientos ---------------------------------------------
  listReleases(q = '', month = ''): Observable<ReleaseAdmin[]> {
    let params = new HttpParams();
    if (q) {
      params = params.set('q', q);
    }
    if (month) {
      params = params.set('month', month);
    }
    return this.http.get<ReleaseAdmin[]>(`${this.baseUrl}/api/v1/admin/releases`, {
      params,
    });
  }

  createRelease(request: ReleaseWriteRequest): Observable<ReleaseAdmin> {
    return this.http.post<ReleaseAdmin>(
      `${this.baseUrl}/api/v1/admin/releases`,
      request,
    );
  }

  updateRelease(
    id: number,
    request: ReleaseWriteRequest,
  ): Observable<ReleaseAdmin> {
    return this.http.put<ReleaseAdmin>(
      `${this.baseUrl}/api/v1/admin/releases/${id}`,
      request,
    );
  }

  deleteRelease(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/api/v1/admin/releases/${id}`,
    );
  }

  // Contactos de prensa e imagen ---------------------------------------
  listPressContacts(): Observable<PressContactList> {
    return this.http.get<PressContactList>(
      `${this.baseUrl}/api/v1/admin/press-contacts`,
    );
  }
}
