import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from './api-base-url';
import type {
  AdminArticleDetail,
  AdminArticlePage,
  AdminArticleStatus,
  ArticleRevision,
  ArticleWriteRequest,
  BandResponse,
  BandWriteRequest,
  CategoryAdmin,
  CategoryWriteRequest,
  MarkdownPreviewResponse,
  MediaAsset,
  MediaPage,
  MediaUpdateRequest,
  TagResponse,
  TagWriteRequest,
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

  // Categorías --------------------------------------------------------
  listCategories(): Observable<CategoryAdmin[]> {
    return this.http.get<CategoryAdmin[]>(
      `${this.baseUrl}/api/v1/admin/categories`,
    );
  }

  createCategory(request: CategoryWriteRequest): Observable<CategoryAdmin> {
    return this.http.post<CategoryAdmin>(
      `${this.baseUrl}/api/v1/admin/categories`,
      request,
    );
  }

  updateCategory(
    id: number,
    request: CategoryWriteRequest,
  ): Observable<CategoryAdmin> {
    return this.http.put<CategoryAdmin>(
      `${this.baseUrl}/api/v1/admin/categories/${id}`,
      request,
    );
  }

  deleteCategory(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.baseUrl}/api/v1/admin/categories/${id}`,
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

  createBand(request: BandWriteRequest): Observable<BandResponse> {
    return this.http.post<BandResponse>(
      `${this.baseUrl}/api/v1/admin/bands`,
      request,
    );
  }

  updateBand(id: number, request: BandWriteRequest): Observable<BandResponse> {
    return this.http.put<BandResponse>(
      `${this.baseUrl}/api/v1/admin/bands/${id}`,
      request,
    );
  }

  deleteBand(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/admin/bands/${id}`);
  }

  // Etiquetas ---------------------------------------------------------
  listTags(q = ''): Observable<TagResponse[]> {
    let params = new HttpParams();
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<TagResponse[]>(`${this.baseUrl}/api/v1/admin/tags`, {
      params,
    });
  }

  createTag(request: TagWriteRequest): Observable<TagResponse> {
    return this.http.post<TagResponse>(
      `${this.baseUrl}/api/v1/admin/tags`,
      request,
    );
  }

  updateTag(id: number, request: TagWriteRequest): Observable<TagResponse> {
    return this.http.put<TagResponse>(
      `${this.baseUrl}/api/v1/admin/tags/${id}`,
      request,
    );
  }

  deleteTag(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/admin/tags/${id}`);
  }

  // Medios ------------------------------------------------------------
  listMedia(page = 0, size = 24, q = ''): Observable<MediaPage> {
    let params = new HttpParams().set('page', page).set('size', size);
    if (q) {
      params = params.set('q', q);
    }
    return this.http.get<MediaPage>(`${this.baseUrl}/api/v1/admin/media`, {
      params,
    });
  }

  uploadMedia(
    file: File,
    altText?: string,
    credit?: string,
  ): Observable<MediaAsset> {
    const form = new FormData();
    form.append('file', file);
    if (altText) {
      form.append('altText', altText);
    }
    if (credit) {
      form.append('credit', credit);
    }
    return this.http.post<MediaAsset>(
      `${this.baseUrl}/api/v1/admin/media`,
      form,
    );
  }

  updateMedia(id: number, request: MediaUpdateRequest): Observable<MediaAsset> {
    return this.http.patch<MediaAsset>(
      `${this.baseUrl}/api/v1/admin/media/${id}`,
      request,
    );
  }

  deleteMedia(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/api/v1/admin/media/${id}`);
  }
}
