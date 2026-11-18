import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';
import { LEGAL_DATA, legalDataComplete } from './legal-data';

@Component({
  selector: 'app-legal-page',
  imports: [RouterLink],
  templateUrl: './legal-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPage {
  protected readonly legal = LEGAL_DATA;
  protected readonly complete = legalDataComplete(LEGAL_DATA);

  constructor() {
    inject(SeoService).apply({
      title: 'Aviso legal — The Blast Beast',
      description:
        'Titular, condiciones de uso y propiedad intelectual de The Blast Beast.',
      path: '/aviso-legal',
      noIndex: !this.complete,
    });
  }
}
