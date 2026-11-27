import type {
  BandSummary,
  CategorySummary,
  MediaSummary,
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export type AdminArticleStatus = 'draft' | 'published' | 'archived';

export type SocialSummarySource = 'ai' | 'template';

export type SocialSummaryPlatform = 'x' | 'facebook' | 'instagram' | 'whatsapp';

export interface SocialSummaryVariants {
  x: string;
  facebook: string;
  instagram: string;
  whatsapp: string;
}

export interface SocialSummaryResponse {
  source: SocialSummarySource;
  variants: SocialSummaryVariants;
}

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
  bandNames?: string[];
  tagNames?: string[];
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

export interface BandResponse extends BandSummary {
  country?: string | null;
  formedYear?: number | null;
  website?: string | null;
  bandcampUrl?: string | null;
  spotifyUrl?: string | null;
}

export interface ArticleCoverUpdateRequest {
  altText?: string | null;
  credit?: string | null;
}

export interface PressContact {
  categoria: string;
  nombre: string;
  tipo: string;
  pais: string;
  web: string;
  enlace: string;
  email: string;
  contactoNombre: string;
  idioma: string;
  tipoDeMaterial: string;
  licenciaUso: string;
  notas: string;
  verificado: string;
}

export interface PressContactList {
  rows: PressContact[];
  total: number;
  updatedAt?: string | null;
}

export type {
  ReleaseAdmin,
  ReleaseKind,
  ReleaseWriteRequest,
} from './release.models';
