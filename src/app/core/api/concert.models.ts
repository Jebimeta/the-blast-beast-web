export type ConcertStatus = 'ON_SALE' | 'OFF_SALE' | 'POSTPONED' | 'RESCHEDULED' | 'CANCELLED';

export interface VenueSummary {
  id: number;
  name: string;
  city: string;
  citySlug: string;
  region?: string | null;
}

export interface VenueDetail extends VenueSummary {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface ConcertArtist {
  slug: string;
  name: string;
  bandSlug?: string | null;
}

export interface ConcertSummary {
  id: number;
  slug: string;
  title: string;
  startAt: string;
  endAt?: string | null;
  timeTba?: boolean | null;
  status: ConcertStatus;
  genre: string;
  genreLabel: string;
  venue: VenueSummary;
  artists: ConcertArtist[];
  ticketUrl?: string | null;
  priceMin?: number | null;
  priceMax?: number | null;
  currency?: string | null;
  featured?: boolean | null;
}

export interface ConcertDetail extends Omit<ConcertSummary, 'venue'> {
  description?: string | null;
  venue: VenueDetail;
  imageUrl?: string | null;
  imageAttribution?: string | null;
  source?: string | null;
  sourceUrl?: string | null;
}

export interface ConcertPage {
  content: ConcertSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface FacetValue {
  value: string;
  label: string;
  count: number;
}

export interface ConcertDayCount {
  date: string;
  count: number;
}

export interface ConcertFacets {
  genres: FacetValue[];
  cities: FacetValue[];
  artists: FacetValue[];
  days: ConcertDayCount[];
  earliest?: string | null;
  latest?: string | null;
}

export interface ConcertQuery {
  page?: number;
  size?: number;
  genre?: string;
  city?: string;
  band?: string;
  from?: string;
  to?: string;
}
