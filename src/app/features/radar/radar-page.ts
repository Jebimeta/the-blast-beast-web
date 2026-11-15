import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import type { ReleaseKind, ReleaseSummary } from '../../core/api/release.models';
import type { RadarData } from './radar.resolver';
import {
  currentMonth,
  formatMonth,
  formatReleaseDay,
  formatReleaseMonth,
  isReleaseKind,
  releaseTypeLabel,
  shiftMonth,
} from './radar.utils';

@Component({
  selector: 'app-radar-page',
  imports: [RouterLink],
  templateUrl: './radar-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RadarPage {
  readonly radar = input.required<RadarData>();

  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly month = computed(() => this.radar().month);
  protected readonly monthLabel = computed(() => formatMonth(this.month()));
  protected readonly releases = computed(() => this.radar().page.content);
  protected readonly genres = computed(() => this.radar().page.genres);
  protected readonly types = computed(() => this.radar().page.types);
  protected readonly total = computed(() => this.radar().page.totalElements);
  protected readonly activeGenre = computed(() => this.radar().genre);
  protected readonly activeType = computed(() => this.radar().type);
  protected readonly hasFilters = computed(
    () => this.activeGenre() !== null || this.activeType() !== null,
  );

  protected readonly highlight = computed<ReleaseSummary | null>(() => {
    const releases = this.releases();
    return releases.find((release) => release.featured) ?? releases[0] ?? null;
  });

  protected readonly rest = computed(() => {
    const highlight = this.highlight();
    return highlight
      ? this.releases().filter((release) => release.id !== highlight.id)
      : [];
  });

  protected readonly todayMonth = currentMonth();
  protected readonly previousMonth = computed(() =>
    shiftMonth(this.month(), -1),
  );
  protected readonly nextMonth = computed(() => shiftMonth(this.month(), 1));
  protected readonly calendarUrl = '/api/v1/releases/calendar.ics?months=6';

  protected readonly typeLabel = releaseTypeLabel;
  protected readonly day = formatReleaseDay;
  protected readonly shortMonth = formatReleaseMonth;

  constructor() {
    effect(() => {
      const month = this.month();
      const monthLabel = this.monthLabel();
      const total = this.total();
      const genre = this.activeGenre();
      const type = this.activeType();
      const releases = this.releases();

      const filters = [genre, type].filter(Boolean).join(' · ');
      const path = `/radar?mes=${month}${genre ? `&genero=${genre}` : ''}${
        type ? `&tipo=${type}` : ''
      }`;

      this.seo.apply({
        title: `Radar de lanzamientos de ${monthLabel} — The Blast Beast`,
        description: `Discos, EPs y singles que llegan en ${monthLabel}: ${total} lanzamientos seleccionados por la redacción${
          filters ? ` (${filters})` : ''
        }.`,
        path,
      });

      this.seo.applyBreadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Radar de lanzamientos', path: '/radar' },
      ]);

      this.seo.applyItemListJsonLd({
        name: `Lanzamientos de ${monthLabel}`,
        items: releases.map((release) => ({
          name: `${release.artistName} — ${release.title}`,
          path: `/radar?mes=${month}#release-${release.slug}`,
        })),
      });
    });
  }

  protected filterGenre(genre: string | null): void {
    this.navigate(this.month(), genre, this.activeType());
  }

  protected filterType(type: ReleaseKind | null): void {
    this.navigate(this.month(), this.activeGenre(), type);
  }

  protected selectType(value: string): void {
    this.filterType(isReleaseKind(value) ? value : null);
  }

  protected goToMonth(month: string): void {
    this.navigate(month, this.activeGenre(), this.activeType());
  }

  protected clearFilters(): void {
    this.navigate(this.month(), null, null);
  }

  private navigate(
    month: string,
    genre: string | null,
    type: ReleaseKind | null,
  ): void {
    void this.router.navigate(['/radar'], {
      queryParams: {
        mes: month,
        genero: genre,
        tipo: type,
      },
    });
  }
}
