import type { PressContact } from '../../../core/api/admin.models';

export type PressContactsCsvFormat = 'csv' | 'excel';

export interface PressContactsCsvColumn {
  header: string;
  key: keyof PressContact;
}

/**
 * Cabeceras originales del CSV de docs/ para que la descarga siga siendo
 * compatible con el archivo de referencia.
 */
export const PRESS_CONTACT_CSV_COLUMNS: readonly PressContactsCsvColumn[] = [
  { header: 'categoria', key: 'categoria' },
  { header: 'nombre', key: 'nombre' },
  { header: 'tipo', key: 'tipo' },
  { header: 'pais', key: 'pais' },
  { header: 'web', key: 'web' },
  { header: 'enlace', key: 'enlace' },
  { header: 'email', key: 'email' },
  { header: 'contacto_nombre', key: 'contactoNombre' },
  { header: 'idioma', key: 'idioma' },
  { header: 'tipo_de_material', key: 'tipoDeMaterial' },
  { header: 'licencia_uso', key: 'licenciaUso' },
  { header: 'notas', key: 'notas' },
  { header: 'verificado', key: 'verificado' },
];

export function buildPressContactsCsv(
  rows: readonly PressContact[],
  format: PressContactsCsvFormat,
): string {
  const delimiter = format === 'excel' ? ';' : ',';
  const lines = [
    PRESS_CONTACT_CSV_COLUMNS.map((column) => quote(column.header)),
    ...rows.map((row) =>
      PRESS_CONTACT_CSV_COLUMNS.map((column) => quote(row[column.key] ?? '')),
    ),
  ];

  return `\uFEFF${lines.map((line) => line.join(delimiter)).join('\r\n')}\r\n`;
}

export function pressContactsCsvFileName(
  format: PressContactsCsvFormat,
): string {
  return format === 'excel'
    ? 'contactos-prensa-e-imagenes-excel.csv'
    : 'contactos-prensa-e-imagenes.csv';
}

function quote(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}
