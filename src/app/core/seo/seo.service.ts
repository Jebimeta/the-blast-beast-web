import { DOCUMENT, isPlatformServer } from '@angular/common';
import { DestroyRef, Injectable, inject, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
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
  noIndex?: boolean;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const ARTICLE_JSON_LD_ID = 'article-jsonld';
const BREADCRUMB_JSON_LD_ID = 'breadcrumb-jsonld';
const SITE_JSON_LD_ID = 'site-jsonld';
const FEED_LINK_SELECTOR = 'link[data-page-feed]';

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

    if (data.image) {
      this.setMeta('property', 'og:image', data.image);
      this.setMeta('name', 'twitter:image', data.image);
    } else {
      this.meta.removeTag('property="og:image"');
      this.meta.removeTag('name="twitter:image"');
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
