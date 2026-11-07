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
| Renderizado | SSR por petición (`@angular/ssr`, `RenderMode.Server`) |
| Estilos | Tailwind CSS 4 con tokens propios |
| HTTP | `HttpClient` con `fetch`, proxy en desarrollo |
| Tests | Vitest + Angular TestBed |

## Rutas

| Ruta | Contenido |
|---|---|
| `/` | Portada: destacados, secciones y últimas noticias |
| `/articulos` | Archivo completo con orden y paginación |
| `/categorias/:slug` | Sección con filtro por categoría |
| `/articulos/:slug` | Detalle de la noticia |
| `/bandas/:slug` | Banda y sus noticias |
| `/buscar?q=` | Búsqueda full-text |
| `**` | 404 real (status HTTP en SSR) |

Cada ruta resuelve sus datos con un `ResolveFn` y los entrega al componente mediante
`withComponentInputBinding()`. Las páginas no piden datos en `ngOnInit`.

## Desarrollo

Requisitos: Node 24 LTS.

```bash
npm ci
npm start
```

- Web: http://localhost:4200
- Las peticiones a `/api/*` se redirigen a `http://localhost:8080` (ver `proxy.conf.json`).
- La API debe estar levantada. Con el perfil `dev` carga el contenido de ejemplo.

## Build y SSR

```bash
npm run build
npm run serve:ssr:the-blast-beast-web
```

El servidor SSR escucha en `PORT` (4000 por defecto) y renderiza cada ruta por petición:
el contenido cambia con cada publicación, así que no hay prerender en build.

| Variable | Uso |
|---|---|
| `API_BASE_URL` | URL absoluta de la API durante el SSR (por defecto `http://localhost:8080`) |
| `SITE_BASE_URL` | Origen público para canonical y Open Graph (por defecto `http://localhost:4000`) |
| `ALLOWED_HOSTS` | Hosts aceptados por el motor SSR, separados por comas |
| `PORT` | Puerto del servidor Express |

En el navegador las peticiones salen relativas (`/api/...`) y las resuelve el proxy de
desarrollo o Caddy en producción.

El stack completo (API + web + PostgreSQL + Caddy) se levanta desde la raíz del workspace
con `docker compose up -d --build` y queda en http://localhost:8088.

## SEO

`SeoService` gestiona por ruta `<title>`, `description`, canonical, Open Graph, Twitter Card
y JSON-LD `NewsArticle`. Las páginas de error, la búsqueda y los 404/410 llevan
`noindex,follow` y no publican canonical.

Los estados 404 y 410 se devuelven de verdad en SSR con `RESPONSE_INIT`, no solo en el HTML.

## Tests

```bash
npm test
```

Cubren la portada (contenido y estado vacío) y el shell de la aplicación. Los tests de
servicios y e2e llegan en M4.

## Estructura

```
src/app/
├── core/
│   ├── api/           # modelos, ArticleApiService, API_BASE_URL
│   ├── seo/           # SeoService y SITE_URL
│   ├── category-store.ts
│   └── format.ts
├── features/
│   ├── home/          # portada + resolver
│   ├── articles/      # tarjeta, listado, detalle, resolvers
│   ├── bands/         # ficha de banda + resolver
│   ├── search/        # búsqueda + resolver
│   └── not-found/
├── layout/            # header, footer
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

- [x] **M0** Fundaciones: Angular 22 + SSR, Tailwind, layout, integración con la API
- [x] **M1** Lectura: portada, archivo, secciones, detalle, bandas, búsqueda y SEO
- [ ] **M2** Redacción: login, editor Markdown, medios
- [ ] **M3** SEO avanzado: sitemap, RSS, prerender selectivo
- [ ] **M4** Calidad: e2e, accesibilidad, presupuesto de rendimiento
- [ ] **M5** Producción

## Licencia

MIT
