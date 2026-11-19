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
    request,
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

    // La sección y las etiquetas se eligen por separado: la etiqueta se
    // guarda aunque no coincida con la categoría del artículo.
    await page.locator('#tagIds').click();
    await page.getByRole('checkbox', { name: 'España' }).check();
    await page.keyboard.press('Escape');

    await expect(
      page.getByText('Guarda el borrador para generar los textos.'),
    ).toBeVisible();

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

    const tagged = await request.get('/api/v1/articles?tag=espana&size=50');
    expect(tagged.status()).toBe(200);
    const taggedBody = (await tagged.json()) as {
      content: { title: string }[];
    };
    expect(taggedBody.content.some((article) => article.title === title)).toBe(
      true,
    );

    // Sin AI_API_KEY el resumen usa la plantilla local, pero sigue siendo útil.
    await page.getByRole('button', { name: 'Generar textos' }).click();
    await expect(page.getByText('Plantilla', { exact: true })).toBeVisible();
    for (const platform of ['X', 'Facebook', 'Instagram', 'WhatsApp']) {
      const variant = page.getByLabel(platform, { exact: true });
      await expect(variant).toHaveValue(new RegExp(title));
      await expect(variant).toHaveValue(/\/articulos\//);
    }

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

  test('crear y eliminar un lanzamiento desde el radar editorial', async ({
    page,
    request,
  }) => {
    await loginAsAdmin(page);
    await page.goto('/admin/radar');

    await expect(
      page.getByRole('heading', { name: 'Radar de lanzamientos' }),
    ).toBeVisible();

    const now = new Date();
    const month = `${now.getUTCFullYear()}-${String(
      now.getUTCMonth() + 1,
    ).padStart(2, '0')}`;
    const stamp = Date.now();
    const title = `Prueba radar ${stamp}`;
    const artist = `Artista e2e ${stamp}`;

    await page.getByLabel('Título').fill(title);
    await page.getByLabel('Artista').fill(artist);
    await page.getByLabel('Fecha').fill(`${month}-15`);
    await page.getByLabel('Género').fill('Heavy metal');
    await page.getByLabel('Sello').fill('Sello e2e');
    await page.getByRole('button', { name: 'Crear', exact: true }).click();

    await expect(
      page.getByText(`Lanzamiento «${title}» creado.`),
    ).toBeVisible();
    await expect(page.getByText(title).first()).toBeVisible();

    const publicList = await request.get(
      `/api/v1/releases?month=${month}&size=100`,
    );
    expect(publicList.status()).toBe(200);
    const body = (await publicList.json()) as {
      content: { title: string; artistName: string }[];
    };
    expect(
      body.content.some(
        (release) => release.title === title && release.artistName === artist,
      ),
    ).toBe(true);

    await page.goto('/admin/radar');
    await page.getByLabel('Buscar lanzamientos').fill(title);
    const row = page.locator('li', { hasText: title });
    await expect(row).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Eliminar' }).click();
    await expect(
      page.getByText(`Lanzamiento «${title}» eliminado.`),
    ).toBeVisible();
    await expect(page.locator('li', { hasText: title })).toHaveCount(0);
  });

  test('el listado editorial filtra por estado y texto', async ({ page }) => {
    await loginAsAdmin(page);

    await page.getByPlaceholder(/Buscar/i).first().fill('Metallica');
    await expect(
      page.getByRole('link', { name: /Metallica anuncia una gira/i }).first(),
    ).toBeVisible();
  });
});
