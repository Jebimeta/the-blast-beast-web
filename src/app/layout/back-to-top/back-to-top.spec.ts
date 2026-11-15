import { TestBed } from '@angular/core/testing';
import { BackToTop } from './back-to-top';

describe('BackToTop', () => {
  let scrollTo: ReturnType<typeof vi.spyOn>;

  const setScrollY = (value: number) =>
    Object.defineProperty(window, 'scrollY', {
      value,
      configurable: true,
      writable: true,
    });

  beforeEach(async () => {
    setScrollY(0);
    scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    await TestBed.configureTestingModule({
      imports: [BackToTop],
    }).compileComponents();
  });

  afterEach(() => {
    scrollTo.mockRestore();
    setScrollY(0);
  });

  it('aparece al bajar y vuelve arriba al pulsarlo', async () => {
    const fixture = TestBed.createComponent(BackToTop);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('button')).toBeNull();

    setScrollY(800);
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector(
      'button',
    ) as HTMLButtonElement | null;
    expect(button).toBeTruthy();
    expect(button?.getAttribute('aria-label')).toBe('Volver arriba');

    button?.click();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });
});
