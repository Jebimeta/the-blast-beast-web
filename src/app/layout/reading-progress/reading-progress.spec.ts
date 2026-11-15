import { TestBed } from '@angular/core/testing';
import { ReadingProgress } from './reading-progress';

function setScrollMetrics(
  element: HTMLElement,
  metrics: { scrollHeight: number; clientHeight: number; scrollTop: number },
): void {
  Object.defineProperty(element, 'scrollHeight', {
    configurable: true,
    value: metrics.scrollHeight,
  });
  Object.defineProperty(element, 'clientHeight', {
    configurable: true,
    value: metrics.clientHeight,
  });
  Object.defineProperty(element, 'scrollTop', {
    configurable: true,
    value: metrics.scrollTop,
  });
}

describe('ReadingProgress', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReadingProgress],
    }).compileComponents();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calcula el porcentaje de lectura al hacer scroll', () => {
    const root = document.documentElement;
    setScrollMetrics(root, {
      scrollHeight: 2000,
      clientHeight: 1000,
      scrollTop: 0,
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    const fixture = TestBed.createComponent(ReadingProgress);
    fixture.detectChanges();

    const bar = fixture.nativeElement.querySelector(
      '.bg-blood-soft',
    ) as HTMLDivElement;
    expect(bar.getAttribute('style')).toContain('width: 0%');

    setScrollMetrics(root, {
      scrollHeight: 2000,
      clientHeight: 1000,
      scrollTop: 500,
    });
    window.dispatchEvent(new Event('scroll'));
    fixture.detectChanges();

    expect(bar.getAttribute('style')).toContain('width: 50%');
  });

  it('se mantiene en el 0 % cuando la página no tiene scroll', () => {
    const root = document.documentElement;
    setScrollMetrics(root, {
      scrollHeight: 800,
      clientHeight: 800,
      scrollTop: 0,
    });
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    const fixture = TestBed.createComponent(ReadingProgress);
    fixture.detectChanges();

    const bar = fixture.nativeElement.querySelector(
      '.bg-blood-soft',
    ) as HTMLDivElement;
    expect(bar.getAttribute('style')).toContain('width: 0%');
  });
});
