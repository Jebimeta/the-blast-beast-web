import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, finalize, map, of, tap } from 'rxjs';
import { ArticleApiService } from './api/article-api.service';
import type { CategoryResponse } from './api/article.models';

/**
 * Caché de categorías para la navegación global.
 *
 * Se carga una sola vez por instancia de aplicación: en SSR, una vez por
 * petición; en el navegador, una vez hasta recargar. Si la API no responde,
 * la navegación se queda sin secciones pero el resto del sitio funciona.
 */
@Injectable({ providedIn: 'root' })
export class CategoryStore {
  private readonly api = inject(ArticleApiService);
  private readonly state = signal<CategoryResponse[]>([]);
  private loaded = false;

  readonly categories = this.state.asReadonly();

  load(): Observable<void> {
    if (this.loaded) {
      return of(void 0);
    }

    return this.api.listCategories().pipe(
      tap((categories) => this.state.set(categories)),
      map(() => void 0),
      catchError(() => of(void 0)),
      finalize(() => {
        this.loaded = true;
      }),
    );
  }

  /** Fuerza una recarga tras cambiar la taxonomía desde la redacción. */
  reload(): Observable<void> {
    this.loaded = false;
    return this.load();
  }
}
