import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';
import { API_BASE_URL } from './core/api/api-base-url';
import { SITE_URL } from './core/seo/site-url';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
    {
      provide: API_BASE_URL,
      useFactory: () => process.env['API_BASE_URL'] ?? 'http://localhost:8080',
    },
    {
      provide: SITE_URL,
      useFactory: () =>
        (process.env['SITE_BASE_URL'] ?? 'http://localhost:4000').replace(/\/$/, ''),
    },
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
