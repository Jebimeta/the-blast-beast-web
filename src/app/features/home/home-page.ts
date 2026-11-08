import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { formatDate, readingTime } from '../../core/format';
import { SeoService } from '../../core/seo/seo.service';
import { ArticleCard } from '../articles/article-card';
import type { HomeData } from './home.resolver';

@Component({
  selector: 'app-home-page',
  imports: [RouterLink, ArticleCard],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  readonly home = input.required<HomeData>();

  private readonly seo = inject(SeoService);

  protected readonly lead = computed(() => this.home().featured[0] ?? null);
  protected readonly secondary = computed(() => this.home().featured.slice(1));
  protected readonly latest = computed(() => this.home().latest.content);
  protected readonly isEmpty = computed(
    () => !this.lead() && this.latest().length === 0,
  );

  protected readonly leadDate = computed(() =>
    formatDate(this.lead()?.publishedAt),
  );
  protected readonly leadMinutes = computed(() =>
    readingTime(this.lead()?.readingMinutes ?? 0),
  );

  /** Imagen de portada del titular: variante `thumb` para no servir el original. */
  protected readonly leadCover = computed(() => {
    const cover = this.lead()?.cover;
    if (!cover) {
      return null;
    }
    return {
      url: cover.variants?.find((variant) => variant.kind === 'thumb')?.url ?? cover.url,
      altText: cover.altText ?? this.lead()?.title ?? '',
    };
  });

  constructor() {
    this.seo.apply({
      title: 'The Blast Beast — Noticias de heavy metal',
      description:
        'Noticias de heavy metal, lanzamientos, conciertos y entrevistas. Información de la escena sin relleno ni clickbait.',
      path: '/',
    });
  }
}
