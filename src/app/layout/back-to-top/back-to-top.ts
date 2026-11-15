import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  inject,
  signal,
} from '@angular/core';

/** Píxeles de scroll a partir de los cuales se ofrece volver arriba. */
const SHOW_AFTER_PX = 480;

@Component({
  selector: 'app-back-to-top',
  templateUrl: './back-to-top.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BackToTop {
  protected readonly visible = signal(false);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const onScroll = () => this.visible.set(window.scrollY > SHOW_AFTER_PX);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      this.destroyRef.onDestroy(() =>
        window.removeEventListener('scroll', onScroll),
      );
    });
  }

  protected toTop(): void {
    const reduce =
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
}
