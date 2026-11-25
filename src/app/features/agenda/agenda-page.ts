import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { ArticleSummary } from '../../core/api/article.models';
import { formatEventShortDate } from '../../core/format';
import { SeoService } from '../../core/seo/seo.service';
import { LatestTicker } from '../../layout/latest-ticker/latest-ticker';
import { AgendaCalendar } from './agenda-calendar';
import type { AgendaData } from './agenda.resolvers';
import { ConcertCard } from './concert-card';

interface ActiveFilterChip {
  id: string;
  label: string;
  params: Record<string, null>;
}

@Component({
  selector: 'app-agenda-page',
  imports: [RouterLink, AgendaCalendar, ConcertCard, LatestTicker],
  templateUrl: './agenda-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaPage {
  readonly agenda = input.required<AgendaData>();
  readonly ticker = input.required<ArticleSummary[]>();

  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly filters = computed(() => this.agenda().filters);
  protected readonly facets = computed(() => this.agenda().facets);
  protected readonly page = computed(() => this.agenda().page);
  protected readonly hasResults = computed(() => this.page().content.length > 0);
  protected readonly pageNumber = computed(() => this.page().page + 1);
  protected readonly totalPages = computed(() => Math.max(this.page().totalPages, 1));
  protected readonly totalLabel = computed(() => {
    const total = this.page().totalElements;
    return total === 1 ? '1 concierto' : `${total} conciertos`;
  });
  protected readonly selectedDay = computed(() => {
    const filters = this.filters();
    return filters.from && filters.from === filters.to ? filters.from : null;
  });
  protected readonly chips = computed<ActiveFilterChip[]>(() => {
    const filters = this.filters();
    const facets = this.facets();
    const chips: ActiveFilterChip[] = [];

    if (filters.genre) {
      const label =
        facets.genres.find((genre) => genre.value === filters.genre)?.label ?? filters.genre;
      chips.push({
        id: 'genre',
        label: `Género: ${label}`,
        params: { genre: null, page: null },
      });
    }
    if (filters.city) {
      const label =
        facets.cities.find((city) => city.value === filters.city)?.label ?? filters.city;
      chips.push({
        id: 'city',
        label: `Ciudad: ${label}`,
        params: { city: null, page: null },
      });
    }
    if (filters.band) {
      const wanted = filters.band.toLowerCase();
      const label =
        facets.artists.find(
          (artist) => artist.value === filters.band || artist.label.toLowerCase() === wanted,
        )?.label ?? filters.band;
      chips.push({
        id: 'band',
        label: `Banda: ${label}`,
        params: { band: null, page: null },
      });
    }
    if (filters.from && filters.to && filters.from === filters.to) {
      chips.push({
        id: 'day',
        label: `Día: ${formatEventShortDate(filters.from)}`,
        params: { from: null, to: null, page: null },
      });
    } else {
      if (filters.from) {
        chips.push({
          id: 'from',
          label: `Desde ${formatEventShortDate(filters.from)}`,
          params: { from: null, page: null },
        });
      }
      if (filters.to) {
        chips.push({
          id: 'to',
          label: `Hasta ${formatEventShortDate(filters.to)}`,
          params: { to: null, page: null },
        });
      }
    }

    return chips;
  });

  constructor() {
    effect(() => {
      const filters = this.filters();
      const facets = this.facets();
      const page = this.page();

      const genre = filters.genre
        ? (facets.genres.find((item) => item.value === filters.genre)?.label ?? filters.genre)
        : null;
      const city = filters.city
        ? (facets.cities.find((item) => item.value === filters.city)?.label ?? filters.city)
        : null;
      const wanted = filters.band?.toLowerCase();
      const artist = wanted
        ? (facets.artists.find(
            (item) => item.value === filters.band || item.label.toLowerCase() === wanted,
          )?.label ?? filters.band)
        : null;

      let heading = 'Agenda de conciertos en España';
      if (city) {
        heading = `Conciertos en ${city}`;
      } else if (genre) {
        heading = `Conciertos de ${genre}`;
      } else if (artist) {
        heading = `Conciertos de ${artist}`;
      } else if (filters.from && filters.from === filters.to) {
        heading = `Conciertos del ${formatEventShortDate(filters.from)}`;
      } else if (filters.from || filters.to) {
        heading = 'Conciertos por fechas';
      }

      const filtered = Boolean(
        filters.genre || filters.city || filters.band || filters.from || filters.to,
      );

      this.seo.apply({
        title: `${heading} — The Blast Beast`,
        description: `${heading}: cartelera actualizada automáticamente con las próximas fechas de conciertos en salas y festivales de España.`,
        path: '/agenda',
        noIndex: filtered,
      });
      this.seo.applyItemListJsonLd({
        name: heading,
        items: page.content.map((concert) => ({
          name: concert.title,
          path: `/agenda#${concert.slug}`,
        })),
      });
      this.seo.applyBreadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Agenda', path: '/agenda' },
      ]);
    });
  }

  protected applyFilters(event: Event): void {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const data = new FormData(form);
    const read = (name: string) => String(data.get(name) ?? '').trim();

    let from = read('from') || null;
    let to = read('to') || null;
    if (from && to && from > to) {
      [from, to] = [to, from];
    }

    void this.router.navigate(['/agenda'], {
      queryParams: {
        genre: read('genre') || null,
        city: read('city') || null,
        band: read('band') || null,
        from,
        to,
        page: null,
      },
    });
  }

  protected clearFilters(): void {
    void this.router.navigate(['/agenda']);
  }

  protected removeFilter(chip: ActiveFilterChip): void {
    void this.router.navigate(['/agenda'], {
      queryParams: chip.params,
      queryParamsHandling: 'merge',
    });
  }

  protected onDateSelected(date: string | null): void {
    void this.router.navigate(['/agenda'], {
      queryParams: { from: date, to: date, page: null },
      queryParamsHandling: 'merge',
    });
  }

  protected goToPage(page: number): void {
    void this.router.navigate(['/agenda'], {
      queryParams: { page: page > 0 ? page : null },
      queryParamsHandling: 'merge',
    });
  }
}
