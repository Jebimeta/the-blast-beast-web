import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import type { ArticleSummary } from '../../core/api/article.models';
import { formatDate } from '../../core/format';

@Component({
  selector: 'app-article-card',
  imports: [RouterLink],
  templateUrl: './article-card.html',
  styleUrl: './article-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCard {
  readonly article = input.required<ArticleSummary>();
  /** Las primeras tarjetas del listado están sobre el pliegue: carga prioritaria. */
  readonly priority = input(false);

  protected readonly published = computed(() =>
    formatDate(this.article().publishedAt),
  );
  protected readonly bandNames = computed(() =>
    this.article()
      .bands.map((band) => band.name)
      .join(', '),
  );

  /** Los listados usan la variante `thumb` (480 px) para no servir el original. */
  protected readonly coverThumb = computed(() => {
    const cover = this.article().cover;
    if (!cover) {
      return null;
    }
    return (
      cover.variants?.find((variant) => variant.kind === 'thumb')?.url ??
      cover.url
    );
  });
}
