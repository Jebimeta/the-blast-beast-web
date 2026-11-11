import { InjectionToken } from '@angular/core';

/**
 * Base absoluta de la API.
 *
 * En el navegador usamos el origen actual: las peticiones siguen siendo same-origin
 * (el proxy de desarrollo o Caddy resuelven `/api`), pero la URL absoluta permite que
 * el transfer cache de hidratación case con la que usó el servidor. En SSR se inyecta
 * el host interno de la API porque no hay un origen sobre el que resolver rutas.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () =>
    typeof location === 'undefined' ? '' : location.origin.replace(/\/$/, ''),
});
