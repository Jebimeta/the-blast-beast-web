import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ArticleSummary } from '../../core/api/article.models';
import { formatDate, readingTime } from '../../core/format';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink],
  templateUrl: './article-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCard {
  readonly article = input.required<ArticleSummary>();

  protected readonly published = computed(() => formatDate(this.article().publishedAt));
  protected readonly minutes = computed(() => readingTime(this.article().readingMinutes));
  protected readonly bandNames = computed(() =>
    this.article()
      .bands.map((band) => band.name)
      .join(', '),
  );
}
