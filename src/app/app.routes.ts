import { Routes } from '@angular/router';
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
    path: '**',
    title: 'Página no encontrada — The Blast Beast',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then((m) => m.NotFoundPage),
  },
];
