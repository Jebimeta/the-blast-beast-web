import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';
import { SITE_URL } from './site-url';

describe('SeoService', () => {
  let service: SeoService;
  let document: Document;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        { provide: SITE_URL, useValue: 'https://theblastbeast.test' },
      ],
    });

    service = TestBed.inject(SeoService);
    document = TestBed.inject(DOCUMENT);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  it('aplica título, descripción, canonical y Open Graph con URL absoluta', () => {
    service.apply({
      title: 'Conciertos — The Blast Beast',
      description: 'Giras y festivales.',
      path: '/categorias/conciertos?page=1',
    });

    expect(title.getTitle()).toBe('Conciertos — The Blast Beast');
    expect(meta.getTag('name="description"')?.content).toBe('Giras y festivales.');
    expect(meta.getTag('property="og:url"')?.content).toBe(
      'https://theblastbeast.test/categorias/conciertos?page=1',
    );
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://theblastbeast.test/categorias/conciertos?page=1');
  });

  it('marca noindex y retira el canonical en páginas no indexables', () => {
    service.apply({
      title: 'Página no encontrada — The Blast Beast',
      description: 'No existe.',
      path: '/no-existe',
      noIndex: true,
    });

    expect(meta.getTag('name="robots"')?.content).toBe('noindex,follow');
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('publica JSON-LD de artículo y migas sin duplicar scripts', () => {
    service.apply({
      title: 'Metallica anuncia gira',
      description: 'Doce fechas.',
      path: '/articulos/metallica-anuncia-gira',
    });
    service.applyArticleJsonLd({
      title: 'Metallica anuncia gira',
      description: 'Doce fechas.',
      path: '/articulos/metallica-anuncia-gira',
      publishedAt: '2026-11-05T09:47:24Z',
      updatedAt: '2026-11-07T09:47:24Z',
      author: 'Redacción Blast Beast',
      section: 'Conciertos',
    });
    service.applyBreadcrumbJsonLd([
      { name: 'Inicio', path: '/' },
      { name: 'Conciertos', path: '/categorias/conciertos' },
    ]);

    expect(document.querySelectorAll('script#article-jsonld')).toHaveLength(1);
    expect(document.querySelectorAll('script#breadcrumb-jsonld')).toHaveLength(1);

    const article = JSON.parse(
      document.querySelector('script#article-jsonld')?.textContent ?? '{}',
    );
    expect(article['@type']).toBe('NewsArticle');
    expect(article['author'].name).toBe('Redacción Blast Beast');

    service.apply({
      title: 'Otra página',
      description: 'Limpia los scripts anteriores.',
      path: '/otra',
    });

    expect(document.querySelectorAll('script[data-seo-jsonld]')).toHaveLength(0);
  });

  it('declara el feed de la página y lo sustituye al cambiar de ruta', () => {
    service.setFeed('/categorias/conciertos/feed.xml', 'Conciertos');
    service.setFeed('/categorias/noticias/feed.xml', 'Noticias');

    const links = document.querySelectorAll<HTMLLinkElement>(
      'link[data-page-feed]',
    );
    expect(links).toHaveLength(1);
    expect(links[0].getAttribute('href')).toBe(
      'https://theblastbeast.test/categorias/noticias/feed.xml',
    );
    expect(links[0].getAttribute('title')).toBe('Noticias');
  });
});
