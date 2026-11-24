import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AdminApiService } from '../../../core/api/admin-api.service';
import type { PressContact } from '../../../core/api/admin.models';
import { AdminPressContactsPage } from './admin-press-contacts-page';
import {
  buildPressContactsCsv,
  pressContactsCsvFileName,
} from './press-contacts-csv';

const CONTACTS: PressContact[] = [
  {
    categoria: 'Sellos',
    nombre: 'Frontiers Music',
    tipo: 'Sello discográfico',
    pais: 'Italia',
    web: 'https://www.frontiers.it/',
    enlace: 'https://www.frontiers.it/press/',
    email: 'prensa@frontiers.it',
    contactoNombre: '',
    idioma: 'Inglés / Italiano',
    tipoDeMaterial: 'Fotos de prensa, portadas y logos',
    licenciaUso: 'Uso editorial con crédito',
    notas: 'Directorio abierto, con comas y "comillas".',
    verificado: '2026-11-19',
  },
  {
    categoria: 'Festivales',
    nombre: 'Leyendas del Rock',
    tipo: 'Festival',
    pais: 'España',
    web: 'https://leyendasdelrock.com/',
    enlace: '',
    email: '',
    contactoNombre: 'Prensa',
    idioma: 'Español',
    tipoDeMaterial: 'Fotos y material de prensa',
    licenciaUso: 'Uso editorial con crédito',
    notas: '',
    verificado: '2026-11-20',
  },
];

describe('AdminPressContactsPage', () => {
  const listPressContacts = vi.fn(() =>
    of({
      rows: CONTACTS,
      total: CONTACTS.length,
      updatedAt: '2026-11-19T10:00:00Z',
    }),
  );

  beforeEach(async () => {
    listPressContacts.mockClear();
    await TestBed.configureTestingModule({
      imports: [AdminPressContactsPage],
      providers: [
        {
          provide: AdminApiService,
          useValue: { listPressContacts },
        },
      ],
    }).compileComponents();
  });

  it('carga y muestra los contactos', () => {
    const fixture = TestBed.createComponent(AdminPressContactsPage);
    fixture.detectChanges();
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(listPressContacts).toHaveBeenCalled();
    expect(text).toContain('Frontiers Music');
    expect(text).toContain('Leyendas del Rock');
    expect(text).toContain('2 contactos');
    expect(text).toContain('prensa@frontiers.it');
  });

  it('filtra por texto libre', () => {
    const fixture = TestBed.createComponent(AdminPressContactsPage);
    fixture.detectChanges();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const search = root.querySelector<HTMLInputElement>('#press-search');
    if (!search) {
      throw new Error('No se encontró el buscador');
    }
    search.value = 'leyendas';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Leyendas del Rock');
    expect(text).not.toContain('Frontiers Music');
    expect(text).toContain('1 visibles');
  });

  it('filtra por categoría', () => {
    const fixture = TestBed.createComponent(AdminPressContactsPage);
    fixture.detectChanges();
    fixture.detectChanges();

    const root = fixture.nativeElement as HTMLElement;
    const category = root.querySelector<HTMLSelectElement>('#press-category');
    if (!category) {
      throw new Error('No se encontró el filtro de categoría');
    }
    category.value = 'Sellos';
    category.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent as string;
    expect(text).toContain('Frontiers Music');
    expect(text).not.toContain('Leyendas del Rock');
  });
});

describe('press contacts CSV', () => {
  it('genera CSV con coma, BOM y cabeceras originales', () => {
    const csv = buildPressContactsCsv([CONTACTS[0]], 'csv');

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"categoria","nombre","tipo"');
    expect(csv).toContain('"contacto_nombre"');
    expect(csv).toContain('"Directorio abierto, con comas y ""comillas""."');
    expect(csv).toContain('\r\n');
  });

  it('genera la variante para Excel con punto y coma', () => {
    const csv = buildPressContactsCsv([CONTACTS[1]], 'excel');

    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"categoria";"nombre";"tipo"');
    expect(csv).toContain('"Leyendas del Rock"');
  });

  it('usa nombres de archivo distintos para cada formato', () => {
    expect(pressContactsCsvFileName('csv')).toBe(
      'contactos-prensa-e-imagenes.csv',
    );
    expect(pressContactsCsvFileName('excel')).toBe(
      'contactos-prensa-e-imagenes-excel.csv',
    );
  });
});
