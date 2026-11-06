# The Blast Beast — Web

![Angular](https://img.shields.io/badge/Angular-22-DD0031?logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)
![SSR](https://img.shields.io/badge/SSR-Angular%20Universal-1F2937)
![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white)

Frontend del portal de noticias de heavy metal **The Blast Beast**.

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Angular 22 (standalone, signals, `OnPush`) |
| Renderizado | SSR + prerender (`@angular/ssr`) |
| Estilos | Tailwind CSS 4 con tokens propios |
| HTTP | `HttpClient` con `fetch`, proxy en desarrollo |
| Tests | Vitest + Angular TestBed |

## Desarrollo

Requisitos: Node 24 LTS.

```bash
npm ci
npm start
```

- Web: http://localhost:4200
- Las peticiones a `/api/*` se redirigen a `http://localhost:8080` (ver `proxy.conf.json`).
- La API debe estar levantada para que la tarjeta de estado aparezca en verde.

## Build y SSR

```bash
npm run build
npm run serve:ssr:the-blast-beast-web
```

El servidor SSR escucha en `PORT` (4000 por defecto). En producción, la URL absoluta de la
API se inyecta con `API_BASE_URL`.

## Tests

```bash
npm test
```

## Estructura

```
src/app/
├── core/api/          # cliente HTTP, tokens de configuración
├── features/          # una carpeta por área funcional
├── layout/            # header, footer, shell
├── app.config.ts      # providers de navegador
├── app.config.server.ts
├── app.routes.ts
└── app.routes.server.ts
```

## Convenciones

- Componentes standalone, sin NgModules.
- Estado con `signals`; RxJS solo para HTTP.
- `ChangeDetectionStrategy.OnPush` en todos los componentes.
- TypeScript estricto (`strict`, `strictTemplates`).
- Accesibilidad: HTML semántico, foco visible, enlace de salto al contenido.

## Roadmap

- [x] **M0** Fundaciones: Angular 22 + SSR, Tailwind, layout, página de estado e integración con la API
- [ ] **M1** Lectura: home con destacados, listado, detalle, búsqueda
- [ ] **M2** Redacción: login, editor Markdown, medios
- [ ] **M3** SEO: meta dinámicos, JSON-LD, sitemap, prerender de artículos
- [ ] **M4** Calidad: e2e, accesibilidad, presupuesto de rendimiento
- [ ] **M5** Producción

## Licencia

MIT
