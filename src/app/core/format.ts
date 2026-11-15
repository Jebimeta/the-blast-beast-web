const dateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});

const eventDateFormatter = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
});

const eventShortDateFormatter = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'Europe/Madrid',
});

const eventTimeFormatter = new Intl.DateTimeFormat('es-ES', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZone: 'Europe/Madrid',
});

const eventDayFormatter = new Intl.DateTimeFormat('es-ES', {
  day: '2-digit',
  timeZone: 'Europe/Madrid',
});

const eventMonthFormatter = new Intl.DateTimeFormat('es-ES', {
  month: 'short',
  timeZone: 'Europe/Madrid',
});

const priceFormatters = new Map<string, Intl.NumberFormat>();

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export function formatShortDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : shortDateFormatter.format(date);
}

/** Fecha larga del evento, siempre en hora peninsular. */
export function formatEventDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const label = eventDateFormatter.format(date);
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function formatEventShortDate(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : eventShortDateFormatter.format(date);
}

export function formatEventTime(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : eventTimeFormatter.format(date);
}

export function formatEventDay(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : eventDayFormatter.format(date);
}

export function formatEventMonth(value: string | null | undefined): string {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const label = Number.isNaN(date.getTime()) ? '' : eventMonthFormatter.format(date);
  return label.replace('.', '').toUpperCase();
}

export function formatPriceRange(
  min: number | null | undefined,
  max: number | null | undefined,
  currency: string | null | undefined,
): string {
  if (min == null && max == null) {
    return '';
  }
  const formatter = priceFormatter(currency);
  if (min != null && max != null && min !== max) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }
  return formatter.format(min ?? max ?? 0);
}

function priceFormatter(currency: string | null | undefined): Intl.NumberFormat {
  const code = currency && /^[A-Za-z]{3}$/.test(currency) ? currency.toUpperCase() : 'EUR';
  const cached = priceFormatters.get(code);
  if (cached) {
    return cached;
  }
  let formatter: Intl.NumberFormat;
  try {
    formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: 2,
    });
  } catch {
    formatter = new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 2,
    });
  }
  priceFormatters.set(code, formatter);
  return formatter;
}
