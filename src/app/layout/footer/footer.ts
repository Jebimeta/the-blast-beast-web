import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Pie público.
 *
 * No se publican enlaces a redes sociales hasta que existan perfiles oficiales:
 * los iconos genéricos apuntaban a las homepages de las plataformas y no
 * aportaban nada al lector.
 */
@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
