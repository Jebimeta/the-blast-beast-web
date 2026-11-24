import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ConcertSummary } from '../../core/api/concert.models';
import { formatEventDay, formatEventMonth, formatEventTime } from '../../core/format';

const STATUS_LABELS: Partial<Record<ConcertSummary['status'], string>> = {
  POSTPONED: 'Aplazado',
  RESCHEDULED: 'Cambio de fecha',
  CANCELLED: 'Cancelado',
};

@Component({
  selector: 'app-concert-card',
  imports: [RouterLink],
  templateUrl: './concert-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcertCard {
  readonly concert = input.required<ConcertSummary>();

  protected readonly day = computed(() => formatEventDay(this.concert().startAt));
  protected readonly month = computed(() => formatEventMonth(this.concert().startAt));
  protected readonly time = computed(() =>
    this.concert().timeTba ? 'Hora por confirmar' : formatEventTime(this.concert().startAt),
  );
  protected readonly artists = computed(() =>
    this.concert()
      .artists.map((artist) => artist.name)
      .join(', '),
  );
  protected readonly statusLabel = computed(() => STATUS_LABELS[this.concert().status] ?? '');
  protected readonly showStatus = computed(() => Boolean(this.statusLabel()));
}
