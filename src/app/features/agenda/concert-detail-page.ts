import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  RESPONSE_INIT,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import type { ArticleSummary } from '../../core/api/article.models';
import type { ConcertStatus } from '../../core/api/concert.models';
import { formatEventDate, formatEventTime, formatPriceRange } from '../../core/format';
import { SeoService } from '../../core/seo/seo.service';
import { LatestTicker } from '../../layout/latest-ticker/latest-ticker';
import type { ConcertDetailData } from './agenda.resolvers';

const STATUS_LABELS: Record<ConcertStatus, string> = {
  ON_SALE: 'Entradas a la venta',
  OFF_SALE: 'Entradas no disponibles',
  POSTPONED: 'Aplazado',
  RESCHEDULED: 'Cambio de fecha',
  CANCELLED: 'Cancelado',
};

const STATUS_NOTICES: Partial<Record<ConcertStatus, string>> = {
  OFF_SALE:
    'Las entradas no están disponibles en este momento. Consulta la web de venta por si vuelven a salir a la venta.',
  POSTPONED:
    'El concierto está aplazado. Conserva tu entrada y consulta la nueva fecha con la promotora.',
  RESCHEDULED:
    'El concierto cambia de fecha. Las entradas emitidas siguen siendo válidas para la nueva fecha.',
  CANCELLED:
    'El concierto ha sido cancelado. Consulta las condiciones de devolución en el punto de venta.',
};

@Component({
  selector: 'app-concert-detail-page',
  imports: [RouterLink, LatestTicker],
  templateUrl: './concert-detail-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcertDetailPage {
  readonly detail = input.required<ConcertDetailData>();
  readonly ticker = input.required<ArticleSummary[]>();

  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  protected readonly concert = computed(() => this.detail().concert);
  protected readonly status = computed(() => this.detail().status);
  protected readonly dateLabel = computed(() => formatEventDate(this.concert()?.startAt));
  protected readonly timeLabel = computed(() => {
    const concert = this.concert();
    if (!concert) {
      return '';
    }
    return concert.timeTba ? 'Hora por confirmar' : formatEventTime(concert.startAt);
  });
  protected readonly priceLabel = computed(() => {
    const concert = this.concert();
    return concert ? formatPriceRange(concert.priceMin, concert.priceMax, concert.currency) : '';
  });
  protected readonly statusLabel = computed(() => {
    const concert = this.concert();
    return concert ? STATUS_LABELS[concert.status] : '';
  });
  protected readonly statusNotice = computed(() => {
    const concert = this.concert();
    return concert ? (STATUS_NOTICES[concert.status] ?? '') : '';
  });
  protected readonly performers = computed(() => this.concert()?.artists ?? []);
  protected readonly description = computed(() => {
    const concert = this.concert();
    if (!concert) {
      return '';
    }
    return (
      concert.description?.trim() ||
      `Concierto de ${concert.genreLabel.toLowerCase()} en ${concert.venue.name}, ${concert.venue.city}.`
    );
  });
  protected readonly hasTickets = computed(() => {
    const concert = this.concert();
    return Boolean(concert && concert.status === 'ON_SALE' && concert.ticketUrl);
  });
  protected readonly sourceLabel = computed(() => {
    const source = this.concert()?.source;
    if (source === 'TICKETMASTER') {
      return 'Ticketmaster';
    }
    if (source === 'DEMO') {
      return 'Datos de demostración';
    }
    return source ?? '';
  });
  protected readonly showSourceLink = computed(() => {
    const concert = this.concert();
    return Boolean(concert && concert.source === 'TICKETMASTER' && concert.sourceUrl);
  });

  constructor() {
    effect(() => {
      const concert = this.concert();
      if (!concert) {
        const notFound = this.status() === 404;
        if (this.responseInit) {
          this.responseInit.status = notFound ? 404 : 500;
        }
        this.seo.apply({
          title: notFound
            ? 'Concierto no encontrado — The Blast Beast'
            : 'Agenda no disponible — The Blast Beast',
          description: notFound
            ? 'El concierto que buscas no existe o ya no está en la agenda.'
            : 'No se ha podido cargar la agenda de conciertos.',
          path: this.router.url.split('?')[0],
          noIndex: true,
        });
        return;
      }

      const path = `/agenda/${concert.slug}`;
      const description = this.description();

      this.seo.apply({
        title: `${concert.title} — The Blast Beast`,
        description,
        path,
        type: 'article',
        image: concert.imageUrl ?? undefined,
      });

      this.seo.applyEventJsonLd({
        name: concert.title,
        description,
        path,
        startDate: concert.startAt,
        endDate: concert.endAt,
        status: concert.status,
        venueName: concert.venue.name,
        address: concert.venue.address,
        city: concert.venue.city,
        region: concert.venue.region,
        image: concert.imageUrl,
        ticketUrl: concert.ticketUrl,
        priceMin: concert.priceMin,
        priceMax: concert.priceMax,
        currency: concert.currency,
        performers: concert.artists.map((artist) => artist.name),
      });

      this.seo.applyBreadcrumbJsonLd([
        { name: 'Inicio', path: '/' },
        { name: 'Agenda', path: '/agenda' },
        { name: concert.title, path },
      ]);
    });
  }
}
