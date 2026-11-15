import type { ReleaseKind } from '../../core/api/release.models';

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

const dayFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  timeZone: 'UTC',
});

const shortMonthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
  timeZone: 'UTC',
});

const fullDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

export const RELEASE_TYPES: readonly ReleaseKind[] = [
  'album',
  'ep',
  'single',
  'live',
  'compilation',
];

const TYPE_LABELS: Record<ReleaseKind, string> = {
  album: 'Álbum',
  ep: 'EP',
  single: 'Single',
  live: 'Directo',
  compilation: 'Recopilatorio',
};

export function isReleaseKind(value: string | null): value is ReleaseKind {
  return value !== null && (RELEASE_TYPES as readonly string[]).includes(value);
}

export function isMonth(value: string | null): value is string {
  return value !== null && MONTH_PATTERN.test(value);
}

/** Mes actual en UTC, el mismo reloj que usa la API. */
export function currentMonth(now = new Date()): string {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const shifted = new Date(Date.UTC(year, monthNumber - 1 + delta, 1));
  return `${shifted.getUTCFullYear()}-${String(shifted.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function formatMonth(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number);
  const label = monthFormatter.format(new Date(Date.UTC(year, monthNumber - 1, 1)));
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatReleaseDay(date: string): string {
  return dayFormatter.format(new Date(`${date}T00:00:00Z`));
}

export function formatReleaseMonth(date: string): string {
  return shortMonthFormatter
    .format(new Date(`${date}T00:00:00Z`))
    .replace('.', '');
}

export function formatReleaseDate(date: string): string {
  return fullDateFormatter
    .format(new Date(`${date}T00:00:00Z`))
    .replace('.', '');
}

export function releaseTypeLabel(kind: ReleaseKind): string {
  return TYPE_LABELS[kind];
}
