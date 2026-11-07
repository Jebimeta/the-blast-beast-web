import { RenderMode, ServerRoute } from '@angular/ssr';

/**
 * Todo se renderiza en servidor por petición.
 *
 * Las páginas se alimentan de la API y el contenido cambia con cada
 * publicación, así que el prerender en tiempo de build no aporta: solo
 * obligaría a tener la API levantada durante el build.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
