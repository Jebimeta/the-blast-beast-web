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
| `/sobre` | Sobre el medio (prerenderizada) |
| `/contacto` | Contacto de la redacción (prerenderizada) |
| `/privacidad` | Política de privacidad (prerenderizada) |
| `/admin/login` | Acceso a la redacción |
| `/admin/articulos` | Listado de artículos con filtros y acciones |
| `/admin/articulos/nuevo` | Editor de artículo nuevo |
| `/admin/articulos/:id` | Editor con vista previa, autoguardado e historial |
| `/admin/taxonomia` | Categorías, bandas y etiquetas |
| `/admin/medios` | Biblioteca de imágenes |
| `**` | 404 real (status HTTP en SSR) |

Cada ruta pública resuelve sus datos con un `ResolveFn` y los entrega al componente mediante
`withComponentInputBinding()`. Las páginas no piden datos en `ngOnInit`.

El panel (`/admin/**`) se renderiza en cliente (`RenderMode.Client`) y está protegido por
`adminGuard`. `AuthService` mantiene el access token en memoria y restaura la sesión con la
cookie de refresco; `authInterceptor` reintenta una vez tras refrescar.

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
el contenido cambia con cada publicación. La excepción son `/sobre`, `/contacto` y
`/privacidad`, que se prerenderizan en build (`RenderMode.Prerender`) porque no dependen de
la API. El resto sigue en `RenderMode.Server` y el panel en `RenderMode.Client`.

| Variable | Uso |
|---|---|
| `API_BASE_URL` | URL absoluta de la API durante el SSR (por defecto `http://localhost:8080`) |
| `SITE_BASE_URL` | Origen público para canonical y Open Graph (por defecto `http://localhost:4000`) |
| `ALLOWED_HOSTS` | Hosts aceptados por el motor SSR, separados por comas |
| `PORT` | Puerto del servidor Express |

`SITE_BASE_URL` también se usa en **tiempo de build** para el canonical y Open Graph de las
tres páginas prerenderizadas. El `Dockerfile` acepta `ARG SITE_BASE_URL` y Compose lo pasa
como build arg; en producción debe apuntar al dominio real antes de construir la imagen.

En el navegador las peticiones salen relativas (`/api/...`) y las resuelve el proxy de
desarrollo o Caddy en producción.

El stack completo (API + web + PostgreSQL + Caddy) se levanta desde la raíz del workspace
con `docker compose up -d --build` y queda en http://localhost:8088.

## SEO

`SeoService` gestiona por ruta `<title>`, `description`, canonical, Open Graph, Twitter Card
y JSON-LD. Las páginas de error, la búsqueda y los 404/410 llevan `noindex,follow` y no
publican canonical. Los listados paginados conservan `?page=N` en el canonical.

JSON-LD:

- Portada: `WebSite` + `Organization` con `SearchAction` a `/buscar?q=`.
- Detalle de artículo: `NewsArticle` con autor, sección, fechas e imagen.
- Detalle, categoría y banda: `BreadcrumbList`.

El `<head>` declara `/feed.xml` como feed global; las páginas de categoría añaden su propio
`/categorias/{slug}/feed.xml`. El sitemap, robots y feeds los genera la API y Caddy los
publica en la raíz del dominio.

Los estados 404 y 410 se devuelven de verdad en SSR con `RESPONSE_INIT`, no solo en el HTML.

## Tests

```bash
npm test
```

Cubren la portada (contenido y estado vacío), el shell de la aplicación y `SeoService`
(canonical, `noindex`, JSON-LD de artículo y migas, y enlace de feed). Los tests de servicios
restantes y e2e llegan en M4.

## Medios

La API genera variantes WebP `thumb` (480 px) y `hero` (1600 px). Las tarjetas y la
portada usan `thumb`; el detalle usa `hero`. El portal nunca descarga el original.

## Estructura

```
src/app/
├── core/
│   ├── api/           # modelos, ArticleApiService, AdminApiService, AuthService, problem.ts
│   ├── auth/          # guard e interceptor
│   ├── seo/           # SeoService y SITE_URL
│   ├── category-store.ts
│   └── format.ts
├── features/
│   ├── admin/         # login, layout, artículos, editor, taxonomía, medios
│   ├── home/          # portada + resolver
│   ├── articles/      # tarjeta, listado, detalle, resolvers
│   ├── bands/         # ficha de banda + resolver
│   ├── search/        # búsqueda + resolver
│   ├── static/        # sobre, contacto y privacidad
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
- [x] **M2** Redacción: login, editor Markdown con autoguardado, taxonomía y medios
- [x] **M3** SEO avanzado: sitemap, robots, RSS, JSON-LD y prerender selectivo
- [ ] **M4** Calidad: e2e, accesibilidad, presupuesto de rendimiento
- [ ] **M5** Producción

## Licencia

MIT
