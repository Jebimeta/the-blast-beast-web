import { expect, test } from '@playwright/test';
import { loginAsAdmin } from './support';

test.describe('Redacción', () => {
  test('el panel exige sesión y el login lleva al listado', async ({ page }) => {
    await page.goto('/admin/articulos');
    await expect(page).toHaveURL(/\/admin\/login/);

    await loginAsAdmin(page);
    await expect(
      page.getByRole('heading', { name: 'Artículos', exact: true }),
    ).toBeVisible();
  });

  test('crear, publicar, comprobar en el portal y eliminar un artículo', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/articulos/nuevo');

    const stamp = Date.now();
    const title = `Prueba e2e ${stamp}`;
    const excerpt = `Entradilla de la prueba e2e ${stamp}.`;
    const body = `## Prueba e2e\n\nContenido generado por Playwright ${stamp}.`;

    await page.getByLabel('Titular').fill(title);
    await page.getByLabel('Entradilla').fill(excerpt);
    await page.getByLabel('Cuerpo (Markdown)').fill(body);
    await page.locator('#categoryId').selectOption({ label: 'Noticias' });

    await page.getByRole('button', { name: 'Guardar borrador' }).click();
    await expect(page).toHaveURL(/\/admin\/articulos\/\d+$/);
    await expect(page.getByLabel('Slug')).toHaveValue(
      new RegExp(`^prueba-e2e-${stamp}$`),
    );

    const editorUrl = page.url();
    await page.getByRole('button', { name: 'Publicar', exact: true }).click();
    await expect(
      page.getByText('Artículo publicado', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Publicado', { exact: true })).toBeVisible();

    const publicLink = page.getByRole('link', { name: /Ver en el portal/ });
    const href = await publicLink.getAttribute('href');
    expect(href).toBeTruthy();

    await page.goto(href!);
    await expect(page.locator('main#contenido h1')).toHaveText(title);
    await expect(page.locator('.article-body')).toContainText(
      'Contenido generado por Playwright',
    );

    // Limpieza: el artículo de prueba no debe quedar en la base de datos.
    await page.goto(editorUrl);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Eliminar artículo' }).click();
    await expect(page).toHaveURL(/\/admin\/articulos$/);
    await expect(page.getByText(title)).toHaveCount(0);
  });

  test('el listado editorial filtra por estado y texto', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByPlaceholder(/Buscar/i).first().fill('Metallica');
    await expect(
      page.getByRole('link', { name: /Metallica anuncia una gira/i }).first(),
    ).toBeVisible();
  });
});
