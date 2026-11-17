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
    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://theblastbeast.test/og-default.jpg',
    );
    expect(meta.getTag('property="og:image:alt"')?.content).toBe(
      'The Blast Beast — Noticias de heavy metal',
    );
    expect(meta.getTag('property="og:image:width"')?.content).toBe('1200');
    expect(meta.getTag('property="og:image:height"')?.content).toBe('630');
    expect(meta.getTag('name="twitter:image"')?.content).toBe(
      'https://theblastbeast.test/og-default.jpg',
    );
    expect(
      document.querySelector('link[rel="canonical"]')?.getAttribute('href'),
    ).toBe('https://theblastbeast.test/categorias/conciertos?page=1');
  });

  it('usa la imagen específica, su alt y la normaliza a URL absoluta', () => {
    service.apply({
      title: 'Metallica anuncia gira',
      description: 'Doce fechas.',
      path: '/articulos/metallica-anuncia-gira',
      type: 'article',
      image: '/media/portada-hero.webp',
      imageAlt: 'Portada de Metallica',
    });

    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://theblastbeast.test/media/portada-hero.webp',
    );
    expect(meta.getTag('property="og:image:alt"')?.content).toBe(
      'Portada de Metallica',
    );
    expect(meta.getTag('name="twitter:image:alt"')?.content).toBe(
      'Portada de Metallica',
    );

    service.apply({
      title: 'Otra noticia',
      description: 'Otra.',
      path: '/articulos/otra',
      image: 'https://cdn.example.com/og.jpg',
    });

    expect(meta.getTag('property="og:image"')?.content).toBe(
      'https://cdn.example.com/og.jpg',
    );
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

  it('publica JSON-LD de evento e ItemList para la agenda', () => {
    service.apply({
      title: 'Agenda de conciertos',
      description: 'Cartelera en España.',
      path: '/agenda',
    });
    service.applyItemListJsonLd({
      name: 'Agenda de conciertos',
      items: [
        { name: 'Metallica: M72 World Tour', path: '/agenda/demo-metallica-madrid' },
      ],
    });
    service.applyEventJsonLd({
      name: 'Metallica: M72 World Tour',
      description: 'Concierto en Madrid.',
      path: '/agenda/demo-metallica-madrid',
      startDate: '2026-12-02T21:00:00+01:00',
      endDate: '2026-12-03T00:00:00+01:00',
      status: 'ON_SALE',
      venueName: 'Movistar Arena',
      address: 'Calle de Raimundo Fernández Villaverde, 61',
      city: 'Madrid',
      region: 'Madrid',
      ticketUrl: 'https://www.ticketmaster.es/',
      priceMin: 65,
      priceMax: 145,
      currency: 'EUR',
      performers: ['Metallica'],
    });

    expect(document.querySelectorAll('script#itemlist-jsonld')).toHaveLength(1);
    expect(document.querySelectorAll('script#event-jsonld')).toHaveLength(1);

    const list = JSON.parse(
      document.querySelector('script#itemlist-jsonld')?.textContent ?? '{}',
    );
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement[0].url).toBe(
      'https://theblastbeast.test/agenda/demo-metallica-madrid',
    );

    const event = JSON.parse(
      document.querySelector('script#event-jsonld')?.textContent ?? '{}',
    );
    expect(event['@type']).toBe('MusicEvent');
    expect(event.eventStatus).toBe('https://schema.org/EventScheduled');
    expect(event.location.name).toBe('Movistar Arena');
    expect(event.location.address.addressCountry).toBe('ES');
    expect(event.performer[0].name).toBe('Metallica');
    expect(event.offers.price).toBe(65);
    expect(event.offers.priceCurrency).toBe('EUR');
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
