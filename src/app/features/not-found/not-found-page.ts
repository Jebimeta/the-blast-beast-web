import {
  ChangeDetectionStrategy,
  Component,
  inject,
  RESPONSE_INIT,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleApiService } from '../../core/api/article-api.service';
import { problemMessage } from '../../core/api/problem';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  templateUrl: './not-found-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly articles = inject(ArticleApiService);

  protected readonly randomLoading = signal(false);
  protected readonly randomError = signal<string | null>(null);

  constructor() {
    const responseInit = inject(RESPONSE_INIT, { optional: true });
    if (responseInit) {
      responseInit.status = 404;
    }

    this.seo.apply({
      title: 'Página no encontrada — The Blast Beast',
      description:
        'La página que buscas no existe. Prueba el buscador o deja que el azar te lleve a otra noticia.',
      path: this.router.url.split('?')[0],
      noIndex: true,
    });
  }

  protected search(event: Event, value: string): void {
    event.preventDefault();
    const query = value.trim();
    if (query.length < 2) {
      return;
    }
    void this.router.navigate(['/buscar'], { queryParams: { q: query } });
  }

  protected openRandom(event: Event): void {
    event.preventDefault();
    if (this.randomLoading()) {
      return;
    }

    this.randomLoading.set(true);
    this.randomError.set(null);
    this.articles.getRandomArticle().subscribe({
      next: (article) => {
        void this.router
          .navigate(['/articulos', article.slug])
          .then(() => this.randomLoading.set(false));
      },
      error: (error: unknown) => {
        this.randomLoading.set(false);
        this.randomError.set(
          problemMessage(
            error,
            'No pudimos encontrar una noticia. Prueba con el archivo.',
          ),
        );
      },
    });
  }
}
