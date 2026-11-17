const MOBILE_QUERY = '(max-width: 1023px)';

/**
 * En móvil el formulario de edición queda debajo del listado, así que al pulsar
 * «Editar» hay que llevar al usuario hasta él. En escritorio no se mueve el scroll.
 */
export function scrollToAdminForm(document: Document, id: string): void {
  if (!document.defaultView?.matchMedia(MOBILE_QUERY).matches) {
    return;
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
