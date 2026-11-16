import { expect, test } from '@playwright/test';
import { SEED_ARTICLE, expectNoAxeViolations, loginAsAdmin } from './support';

const PUBLIC_PAGES = [
  { path: '/', label: 'portada' },
  { path: '/articulos', label: 'archivo' },
  { path: `/articulos/${SEED_ARTICLE}`, label: 'detalle de artículo' },
  { path: '/categorias/noticias', label: 'sección Noticias' },
  { path: '/categorias/conciertos', label: 'categoría' },
  { path: '/buscar?q=metallica', label: 'búsqueda' },
  { path: '/sobre', label: 'sobre' },
  { path: '/contacto', label: 'contacto' },
  { path: '/privacidad', label: 'privacidad' },
  { path: '/esta-ruta-no-existe', label: '404' },
];

test.describe('Accesibilidad WCAG 2.1 AA', () => {
  // Un test por página: cada análisis de axe recibe el timeout completo y un
  // fallo identifica la URL concreta en lugar de agotar el test del recorrido.
  for (const target of PUBLIC_PAGES) {
    test(`${target.label}: sin violaciones`, async ({ page }) => {
      await page.goto(target.path);
      await expect(page.locator('main#contenido h1')).toBeVisible();
      await expectNoAxeViolations(page, target.label);
    });
  }

  test('el login y el panel editorial no tienen violaciones', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    await page.goto('/admin/login');
    await expect(page.getByLabel('Correo')).toBeVisible();
    await expectNoAxeViolations(page, 'login');

    await loginAsAdmin(page);

    const adminPages = [
      { path: '/admin/articulos', label: 'listado editorial' },
      { path: '/admin/articulos/nuevo', label: 'editor de artículo' },
      { path: '/admin/radar', label: 'radar editorial' },
      { path: '/admin/taxonomia', label: 'taxonomía' },
      { path: '/admin/medios', label: 'medios' },
    ];

    for (const target of adminPages) {
      await page.goto(target.path);
      await expect(
        page.getByRole('heading', { name: 'Panel editorial' }),
      ).toBeVisible();
      await expectNoAxeViolations(page, target.label);
    }
  });
});
