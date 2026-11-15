import {
  RELEASE_TYPES,
  currentMonth,
  formatMonth,
  formatReleaseDate,
  formatReleaseDay,
  formatReleaseMonth,
  isMonth,
  isReleaseKind,
  releaseTypeLabel,
  shiftMonth,
} from './radar.utils';

describe('radar utils', () => {
  it('valida meses en formato ISO y tipos de lanzamiento', () => {
    expect(isMonth('2026-11')).toBe(true);
    expect(isMonth('2026-13')).toBe(false);
    expect(isMonth('2026-1')).toBe(false);
    expect(isMonth(null)).toBe(false);

    expect(isReleaseKind('album')).toBe(true);
    expect(isReleaseKind('single')).toBe(true);
    expect(isReleaseKind('vinilo')).toBe(false);
    expect(isReleaseKind(null)).toBe(false);
  });

  it('calcula el mes actual en UTC y desplaza meses entre años', () => {
    expect(currentMonth(new Date('2026-11-15T23:30:00Z'))).toBe('2026-11');
    expect(shiftMonth('2026-01', -1)).toBe('2025-12');
    expect(shiftMonth('2026-12', 1)).toBe('2027-01');
    expect(shiftMonth('2026-11', 2)).toBe('2027-01');
  });

  it('formatea mes y fecha en español sin depender de la zona horaria', () => {
    expect(formatMonth('2026-11')).toBe('Noviembre de 2026');
    expect(formatReleaseDay('2026-11-05')).toBe('05');
    expect(formatReleaseMonth('2026-11-05')).toBe('nov');
    expect(formatReleaseDate('2026-11-05')).toBe('5 nov 2026');
  });

  it('traduce los formatos del contrato a etiquetas editoriales', () => {
    expect(RELEASE_TYPES).toEqual([
      'album',
      'ep',
      'single',
      'live',
      'compilation',
    ]);
    expect(RELEASE_TYPES.map(releaseTypeLabel)).toEqual([
      'Álbum',
      'EP',
      'Single',
      'Directo',
      'Recopilatorio',
    ]);
  });
});
