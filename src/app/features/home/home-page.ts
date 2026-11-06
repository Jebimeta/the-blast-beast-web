import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { SystemApiService, type PingResponse } from '../../core/api/system-api.service';
import { Footer } from '../../layout/footer/footer';
import { Header } from '../../layout/header/header';

type ApiStatus = 'loading' | 'up' | 'down';

interface Feature {
  title: string;
  detail: string;
}

interface Phase {
  id: string;
  title: string;
  detail: string;
  done: boolean;
}

@Component({
  selector: 'app-home-page',
  imports: [Header, Footer],
  templateUrl: './home-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly systemApi = inject(SystemApiService);

  protected readonly status = signal<ApiStatus>('loading');
  protected readonly info = signal<PingResponse | null>(null);

  protected readonly cardClass = computed(() => {
    const base = 'w-full max-w-sm rounded-xl border p-6 ';
    switch (this.status()) {
      case 'up':
        return base + 'border-emerald-500/40 bg-emerald-500/5';
      case 'down':
        return base + 'border-blood/50 bg-blood/5';
      default:
        return base + 'border-line bg-surface';
    }
  });

  protected readonly features: readonly Feature[] = [
    {
      title: 'Contrato primero',
      detail:
        'El openapi.yaml manda: de él se generan los delegates del backend y el cliente del frontend. Una sola verdad.',
    },
    {
      title: 'Esquema versionado',
      detail:
        'Flyway, no ddl-auto. Cada cambio de base de datos es una migración revisable y reversible.',
    },
    {
      title: 'Pensado para Google',
      detail:
        'SSR con prerender, canonical, Open Graph y JSON-LD NewsArticle desde el primer artículo.',
    },
    {
      title: 'Entrega, no demo',
      detail:
        'Docker multi-stage, CI en GitHub Actions, backups y monitorización. Lo que separa un proyecto de un portfolio.',
    },
  ];

  protected readonly roadmap: readonly Phase[] = [
    { id: 'M0', title: 'Fundaciones', detail: 'Contrato, esquema, seguridad base, Docker y CI', done: true },
    { id: 'M1', title: 'Lectura', detail: 'Artículos, categorías, bandas y búsqueda full-text', done: false },
    { id: 'M2', title: 'Redacción', detail: 'Login, editor Markdown, medios y revisiones', done: false },
    { id: 'M3', title: 'SEO', detail: 'Sitemap, RSS y prerender de artículos', done: false },
    { id: 'M4', title: 'Calidad', detail: 'Testcontainers, e2e y accesibilidad', done: false },
    { id: 'M5', title: 'Producción', detail: 'VPS, TLS, backups y monitorización', done: false },
  ];

  constructor() {
    afterNextRender(() => this.checkApi());
  }

  checkApi(): void {
    this.status.set('loading');
    this.systemApi.ping().subscribe({
      next: (info) => {
        this.info.set(info);
        this.status.set('up');
      },
      error: () => {
        this.info.set(null);
        this.status.set('down');
      },
    });
  }
}
