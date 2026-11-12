import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ArticleSummary } from '../../core/api/article.models';
import { formatShortDate } from '../../core/format';

interface TickerItem {
  article: ArticleSummary;
  date: string;
  thumb: string | null;
}

@Component({
  selector: 'app-latest-ticker',
  imports: [NgTemplateOutlet, RouterLink],
  templateUrl: './latest-ticker.html',
  styleUrl: './latest-ticker.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LatestTicker {
  readonly articles = input.required<ArticleSummary[]>();

  protected readonly paused = signal(false);
  protected readonly items = computed<TickerItem[]>(() =>
    this.articles().map((article) => ({
      article,
      date: formatShortDate(article.publishedAt),
      thumb:
        article.cover?.variants?.find((variant) => variant.kind === 'thumb')
          ?.url ??
        article.cover?.url ??
        null,
    })),
  );

  protected togglePause(): void {
    this.paused.update((paused) => !paused);
  }

  /**
   * Si el foco sale de la cinta, devolvemos el scroll horizontal al inicio
   * para que el grupo accesible vuelva a quedar alineado con el viewport.
   */
  protected resetScroll(event: FocusEvent): void {
    const section = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    if (next && section.contains(next)) {
      return;
    }
    const viewport = section.querySelector<HTMLElement>('.ticker-viewport');
    if (viewport) {
      viewport.scrollLeft = 0;
    }
  }
}
