/**
 * Datos del titular exigidos por el artículo 10 de la LSSI-CE.
 *
 * Se dejan vacíos a propósito hasta que el titular los facilite: no se
 * inventan. Mientras falten, `/aviso-legal` se publica con `noindex` y un
 * aviso visible, y el despliegue debe considerarse bloqueado.
 */
export interface LegalData {
  readonly owner: string;
  readonly taxId: string;
  readonly address: string;
  readonly email: string;
}

export const LEGAL_DATA: LegalData = {
  owner: '',
  taxId: '',
  address: '',
  email: 'redaccion@theblastbeast.com',
};

export function legalDataComplete(data: LegalData): boolean {
  return Boolean(
    data.owner.trim() &&
      data.taxId.trim() &&
      data.address.trim() &&
      data.email.trim(),
  );
}
