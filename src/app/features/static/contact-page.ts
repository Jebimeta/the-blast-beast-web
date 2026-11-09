import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-contact-page',
  imports: [RouterLink],
  templateUrl: './contact-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactPage {
  constructor() {
    inject(SeoService).apply({
      title: 'Contacto — The Blast Beast',
      description:
        'Escríbenos con noticias, lanzamientos, propuestas de entrevista o correcciones. La redacción de The Blast Beast responde.',
      path: '/contacto',
    });
  }
}
