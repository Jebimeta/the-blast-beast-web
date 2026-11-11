import {
  ApplicationConfig,
  inject,
  PLATFORM_ID,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration } from '@angular/platform-browser';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
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
    ),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor])),
    provideClientHydration(),
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
