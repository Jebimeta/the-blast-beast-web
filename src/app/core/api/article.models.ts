export type ArticleSort = 'latest' | 'oldest' | 'relevance';

export type MediaKind = 'original' | 'thumb' | 'hero';

export interface MediaVariant {
  kind: MediaKind;
  url: string;
  mimeType: string;
  width: number;
  height: number;
  bytes: number;
}

export interface MediaSummary {
  id: number;
  kind: MediaKind;
  url: string;
  mimeType: string;
  width: number;
  height: number;
  altText?: string | null;
  credit?: string | null;
  variants?: MediaVariant[] | null;
}

export interface CategorySummary {
  id: number;
  slug: string;
  name: string;
}

export interface TagSummary {
  id: number;
  slug: string;
  name: string;
}

export interface BandSummary {
  id: number;
  slug: string;
  name: string;
  genre?: string | null;
}

export interface ArticleSummary {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  category: CategorySummary;
  authorName: string;
  publishedAt: string;
  readingMinutes: number;
  cover?: MediaSummary | null;
  bands: BandSummary[];
  tags: TagSummary[];
}

export interface ArticleDetail extends ArticleSummary {
  bodyHtml: string;
  updatedAt: string;
  seoTitle?: string | null;
  seoDescription?: string | null;
  canonicalUrl?: string | null;
}

export interface ArticlePage {
  content: ArticleSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface CategoryResponse extends CategorySummary {
  description?: string | null;
  articleCount: number;
}

export interface BandDetail extends BandSummary {
  country?: string | null;
  formedYear?: number | null;
  website?: string | null;
  bandcampUrl?: string | null;
  spotifyUrl?: string | null;
  articles: ArticleSummary[];
}

export interface ApiError {
  type: string;
  title: string;
  status: number;
  detail: string;
  code?: string;
}

export interface ArticleQuery {
  page?: number;
  size?: number;
  category?: string;
  tag?: string;
  band?: string;
  q?: string;
  sort?: ArticleSort;
}
