import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  DOCUMENT,
  NgZone,
  PLATFORM_ID,
  inject,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Barra fina de progreso de lectura.
 *
 * <p>Es decorativa: el porcentaje ya se deduce del contenido y de la posición
 * del scroll, así que se oculta a tecnologías de asistencia para no duplicar
 * información.
 */
@Component({
  selector: 'app-reading-progress',
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 bg-transparent"
      aria-hidden="true"
    >
      <div
        class="h-full bg-blood-soft transition-[width] duration-150 ease-out"
        [style.width.%]="progress()"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReadingProgress {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly progress = signal(0);
  private ticking = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const update = () => {
      this.ticking = false;
      const root = this.document.documentElement;
      const max = root.scrollHeight - root.clientHeight;
      const value = max > 0 ? (root.scrollTop / max) * 100 : 0;
      this.progress.set(Math.min(100, Math.max(0, value)));
    };

    const onScroll = () => {
      if (this.ticking) {
        return;
      }
      this.ticking = true;
      this.zone.runOutsideAngular(() => requestAnimationFrame(update));
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    });

    update();
  }
}
