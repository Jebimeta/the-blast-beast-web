import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { HTTP_TRANSFER_CACHE_ORIGIN_MAP } from '@angular/common/http';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './core/api/api-base-url';
import { SITE_URL } from './core/seo/site-url';

const apiBaseUrl = () => process.env['API_BASE_URL'] ?? 'http://localhost:8080';
const siteBaseUrl = () =>
  (process.env['SITE_BASE_URL'] ?? 'http://localhost:4000').replace(/\/$/, '');

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: API_BASE_URL,
      useFactory: apiBaseUrl,
    },
    {
      // En SSR la API se llama por su host interno (p. ej. http://api:8080),
      // mientras que el navegador usa el origen público del sitio. Mapeamos el
      // origen interno al público para que las claves del transfer cache de
      // servidor y cliente coincidan y no se repitan las peticiones.
      provide: HTTP_TRANSFER_CACHE_ORIGIN_MAP,
      useFactory: () => ({ [new URL(apiBaseUrl()).origin]: siteBaseUrl() }),
    },
    {
      provide: SITE_URL,
      useFactory: () =>
        (process.env['SITE_BASE_URL'] ?? 'http://localhost:4000').replace(/\/$/, ''),
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
