import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ConcertSummary } from '../../core/api/concert.models';
import { formatEventDate, formatEventTime } from '../../core/format';

const STATUS_NOTICES: Partial<Record<ConcertSummary['status'], string>> = {
  POSTPONED: 'El concierto está aplazado. Consulta la nueva fecha con la promotora.',
  RESCHEDULED: 'El concierto cambia de fecha. Consulta la nueva fecha con la promotora.',
  CANCELLED: 'El concierto ha sido cancelado.',
};

@Component({
  selector: 'app-concert-card',
  imports: [RouterLink],
  templateUrl: './concert-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConcertCard {
  readonly concert = input.required<ConcertSummary>();

  protected readonly date = computed(() => formatEventDate(this.concert().startAt));
  protected readonly time = computed(() =>
    this.concert().timeTba ? 'Hora por confirmar' : formatEventTime(this.concert().startAt),
  );
  protected readonly statusNotice = computed(() => STATUS_NOTICES[this.concert().status] ?? '');
}
