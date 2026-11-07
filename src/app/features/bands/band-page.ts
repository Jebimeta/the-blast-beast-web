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
import { SeoService } from '../../core/seo/seo.service';
import { ArticleCard } from '../articles/article-card';
import type { BandData } from './band.resolver';

@Component({
  selector: 'app-band-page',
  imports: [RouterLink, ArticleCard],
  templateUrl: './band-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BandPage {
  readonly band = input.required<BandData>();

  private readonly seo = inject(SeoService);
  private readonly router = inject(Router);
  private readonly responseInit = inject(RESPONSE_INIT, { optional: true });

  protected readonly detail = computed(() => this.band().band);
  protected readonly status = computed(() => this.band().status);

  constructor() {
    effect(() => {
      const band = this.detail();
      if (!band) {
        if (this.responseInit) {
          this.responseInit.status = 404;
        }
        this.seo.apply({
          title: 'Banda no encontrada — The Blast Beast',
          description: 'La banda que buscas no está en el archivo de The Blast Beast.',
          path: this.router.url.split('?')[0],
          noIndex: true,
        });
        return;
      }

      this.seo.apply({
        title: `${band.name} — The Blast Beast`,
        description: `Noticias, conciertos y lanzamientos de ${band.name} en The Blast Beast.`,
        path: `/bandas/${band.slug}`,
      });
    });
  }
}
