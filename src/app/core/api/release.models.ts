import type { BandSummary } from './article.models';

export type ReleaseKind = 'album' | 'ep' | 'single' | 'live' | 'compilation';

export interface ReleaseSummary {
  id: number;
  slug: string;
  title: string;
  artistName: string;
  band?: BandSummary | null;
  type: ReleaseKind;
  releaseDate: string;
  genre?: string | null;
  label?: string | null;
  listenUrl?: string | null;
  notes?: string | null;
  featured: boolean;
}

export interface ReleaseFacet {
  value: string;
  label: string;
  count: number;
}

export interface ReleasePage {
  content: ReleaseSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  month: string;
  genres: ReleaseFacet[];
  types: ReleaseFacet[];
}

export interface ReleaseQuery {
  month?: string;
  genre?: string;
  type?: ReleaseKind;
  page?: number;
  size?: number;
}

export interface ReleaseAdmin extends ReleaseSummary {
  bandId?: number | null;
  hidden: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReleaseWriteRequest {
  title: string;
  artistName: string;
  bandId?: number | null;
  type: ReleaseKind;
  releaseDate: string;
  genre?: string | null;
  label?: string | null;
  listenUrl?: string | null;
  notes?: string | null;
  featured?: boolean;
  hidden?: boolean;
}
