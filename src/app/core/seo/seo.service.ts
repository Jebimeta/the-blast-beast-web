import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, inject } from '@angular/core';
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
  noIndex?: boolean;
}

const JSON_LD_ID = 'page-jsonld';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);
  private readonly siteUrl = inject(SITE_URL);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.clearJsonLd());
  }

  apply(data: SeoData): void {
    const url = `${this.siteUrl}${data.path}`;

    this.clearJsonLd();
    this.title.setTitle(data.title);
    this.setMeta('name', 'description', data.description);
    this.setMeta('property', 'og:title', data.title);
    this.setMeta('property', 'og:description', data.description);
    this.setMeta('property', 'og:type', data.type ?? 'website');
    this.setMeta('property', 'og:url', url);
    this.setMeta('name', 'twitter:card', 'summary_large_image');
    this.setMeta('name', 'twitter:title', data.title);
    this.setMeta('name', 'twitter:description', data.description);

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
  }): void {
    const url = `${this.siteUrl}${data.path}`;
    const payload = {
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

    this.clearJsonLd();
    const script = this.document.createElement('script');
    script.type = 'application/ld+json';
    script.id = JSON_LD_ID;
    script.textContent = JSON.stringify(payload);
    this.document.head.appendChild(script);
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

  private setMeta(attribute: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attribute]: key, content });
  }

  private clearJsonLd(): void {
    this.document.getElementById(JSON_LD_ID)?.remove();
  }
}
