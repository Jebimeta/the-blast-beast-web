import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withNoIncrementalHydration } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { CategoryStore } from './core/category-store';
import { authInterceptor } from './core/api/auth.interceptor';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      // En rutas CSR (`/admin/**`) la navegación inicial se activa después del
      // bootstrap. Si se envuelve en una View Transition, el callback espera a
      // `afterNextRender` y, sin un ciclo de detección pendiente, la navegación
      // nunca termina: el outlet queda vacío. Saltar solo la transición inicial
      // evita ese bloqueo; las navegaciones posteriores sí se animan.
      withViewTransitions({ skipInitialTransition: true }),
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    // La app no usa bloques `@defer`. Desactivar la hidratación incremental evita
    // que Angular emita scripts inline de event replay, incompatibles con la CSP
    // estricta (`script-src 'self'`) que aplica Caddy en producción.
    provideClientHydration(withNoIncrementalHydration()),
    provideAppInitializer(() => {
      const store = inject(CategoryStore);
      const load$ = store.load();

      // En SSR esperamos las categorías para renderizar la navegación en el HTML.
      // En el navegador no bloqueamos la hidratación: la barra se rellena en
      // cuanto responde la API (en páginas prerenderizadas no hay transfer cache).
      if (isPlatformBrowser(inject(PLATFORM_ID))) {
        load$.subscribe();
        return;
      }

      return load$;
    }),
  ],
};
