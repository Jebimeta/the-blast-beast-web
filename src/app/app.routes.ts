import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'The Blast Beast — Noticias de heavy metal',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
