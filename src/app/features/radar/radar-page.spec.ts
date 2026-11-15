import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import type {
  ReleasePage,
  ReleaseSummary,
} from '../../core/api/release.models';
import type { RadarData } from './radar.resolver';
import { RadarPage } from './radar-page';

function release(
  id: number,
  slug: string,
  title: string,
  featured = false,
): ReleaseSummary {
  return {
    id,
    slug,
    title,
    artistName: 'Metallica',
    band: { id: 1, slug: 'metallica', name: 'Metallica' },
    type: 'album',
    releaseDate: `2026-11-0${id}`,
    genre: 'Thrash metal',
    label: 'Blackened Recordings',
    listenUrl: null,
    notes: `Nota de ${title}`,
    featured,
  };
}

const page: ReleasePage = {
  content: [
    release(1, 'the-forge-of-fury', 'The Forge of Fury', true),
    release(2, 'the-silent-tide', 'The Silent Tide'),
    release(3, 'shield-of-the-north', 'Shield of the North'),
  ],
  page: 0,
  size: 100,
  totalElements: 3,
  totalPages: 1,
  first: true,
  last: true,
  month: '2026-11',
  genres: [
    { value: 'thrash-metal', label: 'Thrash metal', count: 2 },
    { value: 'heavy-metal', label: 'Heavy metal', count: 1 },
  ],
  types: [
    { value: 'album', label: 'Álbum', count: 2 },
    { value: 'single', label: 'Single', count: 1 },
  ],
};

const data: RadarData = {
  page,
  month: '2026-11',
  genre: null,
  type: null,
};

function textOf(fixture: { nativeElement: HTMLElement }): string {
  return fixture.nativeElement.textContent ?? '';
}

function findButton(
  fixture: { nativeElement: HTMLElement },
  label: string,
): HTMLButtonElement {
  const buttons = Array.from(
    fixture.nativeElement.querySelectorAll('button'),
  ) as HTMLButtonElement[];
  const button = buttons.find(
    (candidate) =>
      (candidate.textContent ?? '').includes(label) ||
      (candidate.getAttribute('aria-label') ?? '').includes(label),
  );
  if (!button) {
    throw new Error(`No se encontró el botón «${label}»`);
  }
  return button;
}

describe('RadarPage', () => {
  let navigate: ReturnType<typeof vi.spyOn>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RadarPage],
      providers: [provideRouter([])],
    }).compileComponents();

    navigate = vi
      .spyOn(TestBed.inject(Router), 'navigate')
      .mockResolvedValue(true);
  });

  it('muestra el destacado, el resto del mes y los filtros', () => {
    const fixture = TestBed.createComponent(RadarPage);
    fixture.componentRef.setInput('radar', data);
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('Noviembre de 2026');
    expect(text).toContain('3 lanzamientos');
    expect(text).toContain('The Forge of Fury');
    expect(text).toContain('The Silent Tide');
    expect(text).toContain('Shield of the North');
    expect(text).toContain('Destacado');
    expect(text).toContain('Thrash metal');
    expect(text).toContain('Suscribirse al calendario');
  });

  it('navega al cambiar de mes o de filtro conservando el resto', () => {
    const fixture = TestBed.createComponent(RadarPage);
    fixture.componentRef.setInput('radar', data);
    fixture.detectChanges();

    findButton(fixture, 'Ver el mes siguiente').click();
    expect(navigate).toHaveBeenCalledWith(['/radar'], {
      queryParams: { mes: '2026-12', genero: null, tipo: null },
    });

    findButton(fixture, 'Thrash metal').click();
    expect(navigate).toHaveBeenCalledWith(['/radar'], {
      queryParams: { mes: '2026-11', genero: 'thrash-metal', tipo: null },
    });

    findButton(fixture, 'Single').click();
    expect(navigate).toHaveBeenCalledWith(['/radar'], {
      queryParams: { mes: '2026-11', genero: null, tipo: 'single' },
    });
  });

  it('ofrece quitar filtros cuando el mes no tiene resultados', () => {
    const fixture = TestBed.createComponent(RadarPage);
    fixture.componentRef.setInput('radar', {
      page: {
        ...page,
        content: [],
        totalElements: 0,
        genres: [],
        types: [],
      },
      month: '2027-02',
      genre: 'thrash-metal',
      type: null,
    } satisfies RadarData);
    fixture.detectChanges();

    const text = textOf(fixture);
    expect(text).toContain('El radar está en silencio');
    expect(text).toContain('Febrero de 2027');

    findButton(fixture, 'Quitar filtros').click();
    expect(navigate).toHaveBeenCalledWith(['/radar'], {
      queryParams: { mes: '2027-02', genero: null, tipo: null },
    });
  });
});
