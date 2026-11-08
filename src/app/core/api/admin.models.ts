import type {
  BandSummary,
  CategorySummary,
  MediaSummary,
  MediaVariant,
  TagSummary,
} from './article.models';

export type AdminRole = 'ADMIN' | 'EDITOR';

export interface AuthUser {
  id: number;
  email: string;
  displayName: string;
  role: AdminRole;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export type AdminArticleStatus = 'draft' | 'published' | 'archived';

export interface AdminArticleSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  status: AdminArticleStatus;
  category: CategorySummary;
  authorName: string;
  publishedAt?: string | null;
  updatedAt: string;
  readingMinutes: number;
  cover?: MediaSummary | null;
  bands: BandSummary[];
  tags: TagSummary[];
}

export interface AdminArticleDetail extends AdminArticleSummary {
  bodyMd: string;
  bodyHtml: string;
  createdAt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}

export interface AdminArticlePage {
  content: AdminArticleSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface ArticleWriteRequest {
  title: string;
  slug?: string | null;
  excerpt: string;
  bodyMd: string;
  categoryId: number;
  bandIds?: number[];
  tagIds?: number[];
  coverMediaId?: number | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}

export interface ArticleRevision {
  id: number;
  title: string;
  bodyMd: string;
  editorName: string;
  createdAt: string;
}

export interface MarkdownPreviewResponse {
  bodyHtml: string;
}

export interface CategoryAdmin extends CategorySummary {
  description?: string | null;
  sortOrder: number;
  articleCount: number;
}

export interface CategoryWriteRequest {
  slug?: string | null;
  name: string;
  description?: string | null;
  sortOrder?: number | null;
}

export interface BandResponse extends BandSummary {
  country?: string | null;
  formedYear?: number | null;
  website?: string | null;
  bandcampUrl?: string | null;
  spotifyUrl?: string | null;
}

export interface BandWriteRequest {
  slug?: string | null;
  name: string;
  country?: string | null;
  formedYear?: number | null;
  genre?: string | null;
  website?: string | null;
  bandcampUrl?: string | null;
  spotifyUrl?: string | null;
}

export interface TagResponse extends TagSummary {}

export interface TagWriteRequest {
  slug?: string | null;
  name: string;
}

export interface MediaAsset extends MediaSummary {
  bytes: number;
  createdAt: string;
  variants: MediaVariant[];
}

export interface MediaPage {
  content: MediaAsset[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface MediaUpdateRequest {
  altText?: string | null;
  credit?: string | null;
}
