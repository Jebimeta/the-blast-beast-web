import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink],
  templateUrl: './about-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutPage {
  constructor() {
    inject(SeoService).apply({
      title: 'Sobre The Blast Beast — Quiénes somos',
      description:
        'The Blast Beast es un medio independiente de heavy metal: noticias, lanzamientos, conciertos y entrevistas sin relleno ni clickbait.',
      path: '/sobre',
    });
  }
}
