import { Routes } from '@angular/router';
import { adminGuard } from './core/auth/admin.guard';
import {
  articleDetailResolver,
  articleListResolver,
} from './features/articles/article.resolvers';
import { bandResolver } from './features/bands/band.resolver';
import { homeResolver } from './features/home/home.resolver';
import { searchResolver } from './features/search/search.resolver';

export const routes: Routes = [
  {
    path: '',
    title: 'The Blast Beast — Noticias de heavy metal',
    resolve: { home: homeResolver },
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: 'articulos',
    title: 'Todas las noticias — The Blast Beast',
    resolve: { list: articleListResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () =>
      import('./features/articles/article-list-page').then((m) => m.ArticleListPage),
  },
  {
    path: 'articulos/:slug',
    title: 'Noticia — The Blast Beast',
    resolve: { detail: articleDetailResolver },
    loadComponent: () =>
      import('./features/articles/article-detail-page').then(
        (m) => m.ArticleDetailPage,
      ),
  },
  {
    path: 'categorias/:slug',
    title: 'Sección — The Blast Beast',
    resolve: { list: articleListResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () =>
      import('./features/articles/article-list-page').then((m) => m.ArticleListPage),
  },
  {
    path: 'buscar',
    title: 'Buscar — The Blast Beast',
    resolve: { search: searchResolver },
    runGuardsAndResolvers: 'paramsOrQueryParamsChange',
    loadComponent: () =>
      import('./features/search/search-page').then((m) => m.SearchPage),
  },
  {
    path: 'bandas/:slug',
    title: 'Banda — The Blast Beast',
    resolve: { band: bandResolver },
    loadComponent: () => import('./features/bands/band-page').then((m) => m.BandPage),
  },
  {
    path: 'admin/login',
    title: 'Acceso a redacción — The Blast Beast',
    loadComponent: () =>
      import('./features/admin/login-page').then((m) => m.AdminLoginPage),
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () =>
      import('./features/admin/admin-layout').then((m) => m.AdminLayout),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'articulos',
      },
      {
        path: 'articulos',
        title: 'Artículos — Redacción',
        loadComponent: () =>
          import('./features/admin/articles/admin-articles-page').then(
            (m) => m.AdminArticlesPage,
          ),
      },
      {
        path: 'articulos/nuevo',
        title: 'Nuevo artículo — Redacción',
        loadComponent: () =>
          import('./features/admin/articles/article-editor-page').then(
            (m) => m.ArticleEditorPage,
          ),
      },
      {
        path: 'articulos/:id',
        title: 'Editar artículo — Redacción',
        loadComponent: () =>
          import('./features/admin/articles/article-editor-page').then(
            (m) => m.ArticleEditorPage,
          ),
      },
      {
        path: 'taxonomia',
        title: 'Taxonomía — Redacción',
        loadComponent: () =>
          import('./features/admin/taxonomy/admin-taxonomy-page').then(
            (m) => m.AdminTaxonomyPage,
          ),
      },
      {
        path: 'medios',
        title: 'Medios — Redacción',
        loadComponent: () =>
          import('./features/admin/media/admin-media-page').then(
            (m) => m.AdminMediaPage,
          ),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada — The Blast Beast',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
