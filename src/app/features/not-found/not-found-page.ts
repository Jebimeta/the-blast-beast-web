import {
  ChangeDetectionStrategy,
  Component,
  inject,
  RESPONSE_INIT,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  template: `
    <main id="contenido" class="shell py-20 sm:py-28">
      <p class="eyebrow">Error 404</p>
      <h1 class="mt-4 font-display text-5xl uppercase leading-none sm:text-7xl">
        Te has salido<br />
        <span class="text-blood-soft">del escenario</span>
      </h1>
      <p class="mt-6 max-w-xl text-lg text-muted">
        La página que buscas no existe. Puede que el enlace esté mal escrito o que
        el contenido ya no esté disponible.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a routerLink="/" class="btn-primary">Volver a la portada</a>
        <a routerLink="/articulos" class="btn-ghost">Ver todas las noticias</a>
      </div>
    </main>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPage {
  private readonly seo = inject(SeoService);

  constructor() {
    const responseInit = inject(RESPONSE_INIT, { optional: true });
    if (responseInit) {
      responseInit.status = 404;
    }

    this.seo.apply({
      title: 'Página no encontrada — The Blast Beast',
      description: 'La página que buscas no existe en The Blast Beast.',
      path: '/404',
      noIndex: true,
    });
  }
}
