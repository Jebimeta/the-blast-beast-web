import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  effect,
  input,
  output,
  signal,
} from '@angular/core';
import type { ConcertDayCount } from '../../core/api/concert.models';

interface CalendarCell {
  date: string | null;
  day: number;
  count: number;
  isSelected: boolean;
  isToday: boolean;
}

const WEEKDAYS = [
  { short: 'L', long: 'lunes' },
  { short: 'M', long: 'martes' },
  { short: 'X', long: 'miércoles' },
  { short: 'J', long: 'jueves' },
  { short: 'V', long: 'viernes' },
  { short: 'S', long: 'sábado' },
  { short: 'D', long: 'domingo' },
];

const MONTH_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  month: 'long',
  year: 'numeric',
});

const DAY_FORMATTER = new Intl.DateTimeFormat('es-ES', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

const MADRID_DATE = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

function madridIsoDate(date: Date): string {
  const parts = MADRID_DATE.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

function isoDate(year: number, monthIndex: number, day: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function monthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}

function parseMonthKey(value: string): { year: number; monthIndex: number } {
  const [year, month] = value.split('-').map(Number);
  return { year, monthIndex: month - 1 };
}

function parseIsoDate(value: string): Date {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day);
}

@Component({
  selector: 'app-agenda-calendar',
  templateUrl: './agenda-calendar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgendaCalendar implements OnInit {
  readonly days = input<ConcertDayCount[]>([]);
  readonly selected = input<string | null>(null);
  readonly earliest = input<string | null>(null);
  readonly latest = input<string | null>(null);

  readonly dateSelected = output<string | null>();

  protected readonly weekdays = WEEKDAYS;
  private readonly today = madridIsoDate(new Date());

  private readonly month = signal('');

  protected readonly monthLabel = computed(() => {
    const value = this.month();
    if (!value) {
      return '';
    }
    const { year, monthIndex } = parseMonthKey(value);
    const label = MONTH_FORMATTER.format(new Date(year, monthIndex, 1));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  protected readonly cells = computed<CalendarCell[]>(() => {
    const value = this.month();
    if (!value) {
      return [];
    }
    const { year, monthIndex } = parseMonthKey(value);
    const counts = new Map(this.days().map((day) => [day.date, day.count]));
    const selected = this.selected();
    const firstWeekday = (new Date(year, monthIndex, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();
    const cells: CalendarCell[] = [];

    for (let index = 0; index < firstWeekday; index++) {
      cells.push({
        date: null,
        day: 0,
        count: 0,
        isSelected: false,
        isToday: false,
      });
    }
    for (let day = 1; day <= totalDays; day++) {
      const date = isoDate(year, monthIndex, day);
      cells.push({
        date,
        day,
        count: counts.get(date) ?? 0,
        isSelected: selected === date,
        isToday: date === this.today,
      });
    }
    while (cells.length % 7 !== 0) {
      cells.push({
        date: null,
        day: 0,
        count: 0,
        isSelected: false,
        isToday: false,
      });
    }
    return cells;
  });

  protected readonly canGoPrev = computed(() => {
    const earliest = this.earliest();
    const current = this.month();
    return Boolean(earliest && current && current > earliest.slice(0, 7));
  });

  protected readonly canGoNext = computed(() => {
    const latest = this.latest();
    const current = this.month();
    return Boolean(latest && current && current < latest.slice(0, 7));
  });

  constructor() {
    effect(() => {
      const selected = this.selected();
      if (selected && this.month() && selected.slice(0, 7) !== this.month()) {
        this.month.set(selected.slice(0, 7));
      }
    });
  }

  ngOnInit(): void {
    this.month.set(this.initialMonth());
  }

  protected moveMonth(delta: number): void {
    const { year, monthIndex } = parseMonthKey(this.month());
    const next = new Date(year, monthIndex + delta, 1);
    this.month.set(monthKey(next.getFullYear(), next.getMonth()));
  }

  protected select(date: string): void {
    this.dateSelected.emit(this.selected() === date ? null : date);
  }

  /** Hasta tres puntos visuales; el número exacto va en la etiqueta accesible. */
  protected dots(count: number): number[] {
    return Array.from({ length: Math.min(count, 3) }, (_, index) => index);
  }

  protected cellLabel(cell: CalendarCell): string {
    if (!cell.date) {
      return '';
    }
    const concerts =
      cell.count === 0
        ? 'sin conciertos'
        : cell.count === 1
          ? '1 concierto'
          : `${cell.count} conciertos`;
    return `${DAY_FORMATTER.format(parseIsoDate(cell.date))}, ${concerts}`;
  }

  private initialMonth(): string {
    const selected = this.selected();
    if (selected) {
      return selected.slice(0, 7);
    }
    const earliest = this.earliest();
    if (earliest) {
      return earliest.slice(0, 7);
    }
    return this.today.slice(0, 7);
  }
}
