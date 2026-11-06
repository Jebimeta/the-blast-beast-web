import { InjectionToken } from '@angular/core';

/**
 * Base absoluta de la API.
 *
 * En el navegador es una cadena vacía: las peticiones salen relativas y las resuelve
 * el proxy de desarrollo o Caddy en producción. En SSR se inyecta una URL absoluta
 * porque el servidor no tiene un origen sobre el que resolver rutas relativas.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  factory: () => '',
});
