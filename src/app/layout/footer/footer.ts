import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type SocialIcon = 'facebook' | 'x' | 'whatsapp' | 'instagram';

interface SocialLink {
  icon: SocialIcon;
  label: string;
  href: string;
}

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly year = new Date().getFullYear();

  /**
   * Enlaces provisionales mientras no existan perfiles oficiales.
   * Sustituir cada `href` por la URL del perfil correspondiente.
   */
  protected readonly socialLinks: readonly SocialLink[] = [
    {
      icon: 'facebook',
      label: 'The Blast Beast en Facebook',
      href: 'https://www.facebook.com/',
    },
    {
      icon: 'x',
      label: 'The Blast Beast en X',
      href: 'https://x.com/',
    },
    {
      icon: 'whatsapp',
      label: 'The Blast Beast en WhatsApp',
      href: 'https://www.whatsapp.com/',
    },
    {
      icon: 'instagram',
      label: 'The Blast Beast en Instagram',
      href: 'https://www.instagram.com/',
    },
  ];
}
