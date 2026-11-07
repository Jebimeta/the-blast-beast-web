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
import { ArticleCard } from '../articles/article-card';
import type { SearchData } from './search.resolver';

@Component({
  selector: 'app-search-page',
  imports: [RouterLink, ArticleCard],
  templateUrl: './search-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchPage {
  readonly search = input.required<SearchData>();

  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  protected readonly q = computed(() => this.search().q);
  protected readonly results = computed(() => this.search().page);
  protected readonly hasQuery = computed(() => this.q().length >= 2);
  protected readonly hasResults = computed(
    () => this.results().content.length > 0,
  );
  protected readonly pageNumber = computed(() => this.results().page + 1);
  protected readonly totalPages = computed(() =>
    Math.max(this.results().totalPages, 1),
  );

  constructor() {
    effect(() => {
      const q = this.q();
      this.seo.apply({
        title: q
          ? `Buscar: ${q} — The Blast Beast`
          : 'Buscar — The Blast Beast',
        description: q
          ? `Resultados de búsqueda para «${q}» en The Blast Beast.`
          : 'Busca noticias, bandas y lanzamientos en el archivo de The Blast Beast.',
        path: q ? `/buscar?q=${encodeURIComponent(q)}` : '/buscar',
        noIndex: true,
      });
    });
  }

  protected submit(event: Event, value: string): void {
    event.preventDefault();
    const q = value.trim();
    if (q.length < 2) {
      return;
    }
    void this.router.navigate(['/buscar'], { queryParams: { q } });
  }

  protected goToPage(page: number): void {
    void this.router.navigate(['/buscar'], {
      queryParams: { q: this.q(), page },
    });
  }
}
