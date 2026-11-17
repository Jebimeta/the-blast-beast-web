import { DOCUMENT, isPlatformServer } from '@angular/common';
import { DestroyRef, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import type { ConcertStatus } from '../api/concert.models';
import { SITE_URL } from './site-url';

export interface SeoData {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  publishedAt?: string;
  updatedAt?: string;
  author?: string;
  section?: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  noIndex?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const ARTICLE_JSON_LD_ID = 'article-jsonld';
const BREADCRUMB_JSON_LD_ID = 'breadcrumb-jsonld';
const SITE_JSON_LD_ID = 'site-jsonld';
const EVENT_JSON_LD_ID = 'event-jsonld';
const ITEM_LIST_JSON_LD_ID = 'itemlist-jsonld';
const FEED_LINK_SELECTOR = 'link[data-page-feed]';
const DEFAULT_OG_IMAGE_PATH = '/og-default.jpg';
const DEFAULT_OG_IMAGE_ALT = 'The Blast Beast — Noticias de heavy metal';
const DEFAULT_OG_IMAGE_WIDTH = '1200';
const DEFAULT_OG_IMAGE_HEIGHT = '630';

const EVENT_STATUS: Record<ConcertStatus, string> = {
  ON_SALE: 'https://schema.org/EventScheduled',
  OFF_SALE: 'https://schema.org/EventScheduled',
  POSTPONED: 'https://schema.org/EventPostponed',
  RESCHEDULED: 'https://schema.org/EventRescheduled',
  CANCELLED: 'https://schema.org/EventCancelled',
};

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = inject(SITE_URL);
  private readonly isServer = isPlatformServer(inject(PLATFORM_ID));

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearJsonLd());
  }

  apply(data: SeoData): void {
    const url = `${this.siteUrl}${data.path}`;
    const image = this.absoluteUrl(data.image ?? DEFAULT_OG_IMAGE_PATH);
    const imageAlt = data.imageAlt ?? DEFAULT_OG_IMAGE_ALT;

    this.clearJsonLd();
    this.clearFeed();
    this.title.setTitle(data.title);
    this.setMeta('name', 'description', data.description);
    this.setMeta('property', 'og:site_name', 'The Blast Beast');
    this.setMeta('property', 'og:locale', 'es_ES');
    this.setMeta('property', 'og:title', data.title);
    this.setMeta('property', 'og:description', data.description);
    this.setMeta('property', 'og:type', data.type ?? 'website');
    this.setMeta('property', 'og:url', url);
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', data.title);
    this.setMeta('name', 'twitter:description', data.description);
    this.setMeta('property', 'og:image', image);
    this.setMeta('name', 'twitter:image', image);
    this.setMeta('property', 'og:image:alt', imageAlt);
    this.setMeta('name', 'twitter:image:alt', imageAlt);

    // Las dimensiones solo son válidas para la imagen por defecto o si el
    // llamador las conoce; una portada no mide 1200×630.
    const width = data.image ? data.imageWidth : Number(DEFAULT_OG_IMAGE_WIDTH);
    const height = data.image ? data.imageHeight : Number(DEFAULT_OG_IMAGE_HEIGHT);
    if (width && height) {
      this.setMeta('property', 'og:image:width', String(width));
      this.setMeta('property', 'og:image:height', String(height));
    } else {
      this.meta.removeTag('property="og:image:width"');
      this.meta.removeTag('property="og:image:height"');
    }

    if (data.publishedAt) {
      this.setMeta('property', 'article:published_time', data.publishedAt);
    } else {
      this.meta.removeTag('property="article:published_time"');
    }
    if (data.updatedAt) {
      this.setMeta('property', 'article:modified_time', data.updatedAt);
    } else {
      this.meta.removeTag('property="article:modified_time"');
    }
    if (data.author) {
      this.setMeta('name', 'author', data.author);
    } else {
      this.meta.removeTag('name="author"');
    }
    if (data.section) {
      this.setMeta('property', 'article:section', data.section);
    } else {
      this.meta.removeTag('property="article:section"');
    }

    if (data.noIndex) {
      this.setMeta('name', 'robots', 'noindex,follow');
      this.document.head.querySelector('link[rel="canonical"]')?.remove();
    } else {
      this.setMeta('name', 'robots', 'index,follow');
      this.setCanonical(url);
    }
  }

  applyArticleJsonLd(data: {
    title: string;
    description: string;
    path: string;
    publishedAt: string;
    updatedAt: string;
    author: string;
    section: string;
    image?: string;
  }): void {
    const url = `${this.siteUrl}${data.path}`;
    const payload: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'NewsArticle',
      headline: data.title,
      description: data.description,
      datePublished: data.publishedAt,
      dateModified: data.updatedAt,
      articleSection: data.section,
      author: {
        '@type': 'Person',
        name: data.author,
      },
      publisher: {
        '@type': 'Organization',
        name: 'The Blast Beast',
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': url,
      },
      url,
      inLanguage: 'es-ES',
    };

    if (data.image) {
      payload['image'] = [data.image];
    }

    this.setJsonLd(ARTICLE_JSON_LD_ID, payload);
  }

  /** WebSite + Organization con SearchAction para la portada. */
  applySiteJsonLd(): void {
    const site = this.siteUrl;
    this.setJsonLd(SITE_JSON_LD_ID, {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          '@id': `${site}/#website`,
          url: `${site}/`,
          name: 'The Blast Beast',
          description:
            'Noticias de heavy metal, lanzamientos, conciertos y entrevistas.',
          inLanguage: 'es-ES',
          publisher: { '@id': `${site}/#organization` },
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${site}/buscar?q={search_term_string}`,
            },
            'query-input': 'required name=search_term_string',
          },
        },
        {
          '@type': 'Organization',
          '@id': `${site}/#organization`,
          name: 'The Blast Beast',
          url: `${site}/`,
          email: 'redaccion@theblastbeast.com',
        },
      ],
    });
  }

  applyBreadcrumbJsonLd(items: BreadcrumbItem[]): void {
    this.setJsonLd(BREADCRUMB_JSON_LD_ID, {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${this.siteUrl}${item.path}`,
      })),
    });
  }

  /**
   * Evento musical para la agenda. Solo se emite en la ficha del concierto:
   * los listados usan `ItemList` para no duplicar eventos en cada página.
   */
  applyEventJsonLd(data: {
    name: string;
    description?: string | null;
    path: string;
    startDate: string;
    endDate?: string | null;
    status: ConcertStatus;
    venueName: string;
    address?: string | null;
    city: string;
    region?: string | null;
    image?: string | null;
    ticketUrl?: string | null;
    priceMin?: number | null;
    priceMax?: number | null;
    currency?: string | null;
    performers: string[];
  }): void {
    const url = `${this.siteUrl}${data.path}`;
    const payload: Record<string, unknown> = {
      '@context': 'https://schema.org',
      '@type': 'MusicEvent',
      name: data.name,
      startDate: data.startDate,
      eventStatus: EVENT_STATUS[data.status],
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: {
        '@type': 'MusicVenue',
        name: data.venueName,
        address: {
          '@type': 'PostalAddress',
          addressLocality: data.city,
          addressRegion: data.region ?? 'España',
          addressCountry: 'ES',
          ...(data.address ? { streetAddress: data.address } : {}),
        },
      },
      url,
      inLanguage: 'es-ES',
    };

    if (data.description) {
      payload['description'] = data.description;
    }
    if (data.endDate) {
      payload['endDate'] = data.endDate;
    }
    if (data.image) {
      payload['image'] = [data.image];
    }
    if (data.performers.length) {
      payload['performer'] = data.performers.map((name) => ({
        '@type': 'MusicGroup',
        name,
      }));
    }

    const price = data.priceMin ?? data.priceMax;
    if (data.ticketUrl && price != null) {
      payload['offers'] = {
        '@type': 'Offer',
        url: data.ticketUrl,
        price,
        priceCurrency: data.currency ?? 'EUR',
        availability:
          data.status === 'ON_SALE'
            ? 'https://schema.org/InStock'
            : 'https://schema.org/SoldOut',
      };
    }

    this.setJsonLd(EVENT_JSON_LD_ID, payload);
  }

  /** Listado de conciertos de la página actual de la agenda. */
  applyItemListJsonLd(data: {
    name: string;
    items: { name: string; path: string }[];
  }): void {
    this.setJsonLd(ITEM_LIST_JSON_LD_ID, {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: data.name,
      numberOfItems: data.items.length,
      itemListElement: data.items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${this.siteUrl}${item.path}`,
        name: item.name,
      })),
    });
  }

  /**
   * Precarga la imagen LCP desde el `<head>` del HTML renderizado en servidor.
   *
   * <p>Sin esta pista, el navegador descubre la portada al parsear el cuerpo y
   * Lighthouse lo penaliza como retraso de carga. Solo se emite en SSR: en el
   * cliente la imagen ya viaja en el HTML hidratado.
   */
  preloadImage(data: {
    href: string;
    srcset?: string;
    sizes?: string;
    media?: string;
  }): void {
    if (!this.isServer) {
      return;
    }

    const selector = data.media
      ? `link[data-lcp-preload][media="${data.media}"]`
      : 'link[data-lcp-preload]:not([media])';
    this.document.head.querySelector(selector)?.remove();
    const link = this.document.createElement('link');
    link.rel = 'preload';
    link.setAttribute('as', 'image');
    link.href = data.href;
    link.setAttribute('fetchpriority', 'high');
    link.setAttribute('data-lcp-preload', '');
    if (data.media) {
      link.setAttribute('media', data.media);
    }
    if (data.srcset) {
      link.setAttribute('imagesrcset', data.srcset);
    }
    if (data.sizes) {
      link.setAttribute('imagesizes', data.sizes);
    }
    // Antes del CSS crítico: el escáner de precarga lo ve cuanto antes.
    const criticalStyle = this.document.head.querySelector('style');
    if (criticalStyle) {
      this.document.head.insertBefore(link, criticalStyle);
    } else {
      this.document.head.appendChild(link);
    }
  }

  /** Declara el feed RSS de la página actual sin duplicar el global. */
  setFeed(path: string, title: string): void {
    let link =
      this.document.head.querySelector<HTMLLinkElement>(FEED_LINK_SELECTOR);

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'alternate';
      link.type = 'application/rss+xml';
      link.setAttribute('data-page-feed', '');
      this.document.head.appendChild(link);
    }

    link.title = title;
    link.href = `${this.siteUrl}${path}`;
  }

  private absoluteUrl(value: string): string {
    if (/^https?:\/\//i.test(value)) {
      return value;
    }
    return `${this.siteUrl}${value.startsWith('/') ? value : `/${value}`}`;
  }

  private setCanonical(url: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]',
    );

    if (!link) {
      link = this.document.createElement('link');
      link.rel = 'canonical';
      this.document.head.appendChild(link);
    }

    link.href = url;
  }

  private setMeta(
    attribute: 'name' | 'property',
    key: string,
    content: string,
  ): void {
    this.meta.updateTag({ [attribute]: key, content });
  }

  private setJsonLd(id: string, payload: unknown): void {
    this.document.getElementById(id)?.remove();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.setAttribute('data-seo-jsonld', '');
    script.textContent = JSON.stringify(payload);
    this.document.head.appendChild(script);
  }

  private clearJsonLd(): void {
    this.document
      .querySelectorAll('script[data-seo-jsonld]')
      .forEach((script) => script.remove());
    this.document.getElementById('page-jsonld')?.remove();
  }

  private clearFeed(): void {
    this.document.head.querySelector(FEED_LINK_SELECTOR)?.remove();
  }
}
