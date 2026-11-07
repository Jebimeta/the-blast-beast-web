import { InjectionToken } from '@angular/core';

/**
 * Origen público del sitio, sin barra final.
 *
 * En el navegador se deduce de `location`; en SSR se inyecta desde
 * `SITE_BASE_URL` para que canonical y Open Graph apunten al dominio real.
 */
export const SITE_URL = new InjectionToken<string>('SITE_URL', {
  factory: () =>
    typeof location === 'undefined' ? '' : location.origin.replace(/\/$/, ''),
});
