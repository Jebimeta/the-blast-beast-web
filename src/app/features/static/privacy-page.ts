import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SeoService } from '../../core/seo/seo.service';

@Component({
  selector: 'app-privacy-page',
  imports: [RouterLink],
  templateUrl: './privacy-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrivacyPage {
  constructor() {
    inject(SeoService).apply({
      title: 'Privacidad — The Blast Beast',
      description:
        'Cómo trata The Blast Beast los datos de sus lectores: sin analítica, sin publicidad y sin cookies de seguimiento.',
      path: '/privacidad',
    });
  }
}
