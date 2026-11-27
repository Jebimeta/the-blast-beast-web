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

    const coverAlt = `Portada e2e ${stamp}`;

    await page.getByLabel('Titular').fill(title);
    await page.getByLabel('Entradilla').fill(excerpt);
    await page.getByLabel('Cuerpo (Markdown)').fill(body);
    await page.locator('#categoryId').selectOption({ label: 'Noticias' });

    // La portada es propia de cada artículo: se selecciona en el editor y se
    // sube al guardar el borrador (todavía no existe el artículo).
    await page
      .getByLabel('Imagen de portada')
      .setInputFiles('e2e/fixtures/portada.png');
    await expect(page.locator('#cover-panel img')).toBeVisible();
    await page.getByLabel('Texto alternativo').fill(coverAlt);
    await expect(
      page.getByText('Se subirá al guardar el borrador.'),
    ).toBeVisible();

    // Bandas y etiquetas se escriben a mano. Al guardar se reutilizan las
    // fichas existentes (Metallica y Giras) sin abrir ningún catálogo.
    await page.locator('#bandNames').fill('Metallica');
    await page.locator('#bandNames').press('Enter');
    await expect(
      page.getByRole('button', { name: 'Quitar Metallica' }),
    ).toBeVisible();
    await page.locator('#tagNames').fill('Giras');
    await page.locator('#tagNames').press('Enter');
    await expect(
      page.getByRole('button', { name: 'Quitar Giras' }),
    ).toBeVisible();

    await expect(
      page.getByText('Guarda el borrador para generar los textos.'),
    ).toBeVisible();

    await page.getByRole('button', { name: 'Guardar borrador' }).click();
    await expect(page).toHaveURL(/\/admin\/articulos\/\d+$/);
    await expect(page.getByLabel('Slug')).toHaveValue(
      new RegExp(`^prueba-e2e-${stamp}$`),
    );

    // La portada quedó asociada al artículo y se sirve desde /media.
    await expect(page.getByAltText(coverAlt)).toBeVisible();
    await expect(page.locator('#cover-panel img')).toHaveAttribute(
      'src',
      /\/media\//,
    );

    const editorUrl = page.url();
    await page.getByRole('button', { name: 'Publicar', exact: true }).click();
    await expect(
      page.getByText('Artículo publicado', { exact: true }),
    ).toBeVisible();
    await expect(page.getByText('Publicado', { exact: true })).toBeVisible();

    const tagged = await request.get('/api/v1/articles?tag=giras&size=50');
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
    const publicCover = page.getByRole('img', { name: coverAlt }).first();
    await expect(publicCover).toBeVisible();
    const coverSrc = await publicCover.getAttribute('src');
    expect(coverSrc).toBeTruthy();

    // La banda escrita a mano enlaza a su página con las noticias asociadas.
    const bandLink = page.locator('a[href="/bandas/metallica"]').first();
    await expect(bandLink).toBeVisible();
    await expect(bandLink).toContainText('Metallica');
    await bandLink.click();
    await expect(page).toHaveURL(/\/bandas\/metallica$/);
    await expect(
      page.getByRole('heading', { name: 'Metallica', exact: true }),
    ).toBeVisible();
    await expect(page.getByText(title).first()).toBeVisible();

    // Limpieza: el artículo de prueba no debe quedar en la base de datos.
    await page.goto(editorUrl);
    page.once('dialog', (dialog) => dialog.accept());
    await page.getByRole('button', { name: 'Eliminar artículo' }).click();
    await expect(page).toHaveURL(/\/admin\/articulos$/);
    await expect(page.getByText(title)).toHaveCount(0);

    // Al borrar el artículo también se elimina su portada.
    const orphan = await request.get(coverSrc!);
    expect(orphan.status()).toBe(404);
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

  test('los contactos de prensa cargan, filtran y se descargan', async ({
    page,
  }) => {
    await loginAsAdmin(page);
    await page.getByRole('link', { name: 'Contactos' }).click();

    await expect(page).toHaveURL(/\/admin\/contactos$/);
    await expect(
      page.getByRole('heading', { name: 'Contactos', exact: true }),
    ).toBeVisible();
    // El e2e monta el fixture de la API (dos filas) para no depender del CSV
    // real, que contiene correos y vive en el repo privado de despliegue.
    await expect(
      page.getByText('Frontiers Music', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('Leyendas del Rock', { exact: true }),
    ).toBeVisible();

    await page.locator('#press-search').fill('Leyendas del Rock');
    await expect(
      page.getByText('Leyendas del Rock', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('Frontiers Music', { exact: true }),
    ).toHaveCount(0);

    await page.locator('#press-search').fill('');
    await page.locator('#press-category').selectOption('Sellos');
    await expect(
      page.getByText('Frontiers Music', { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText('Leyendas del Rock', { exact: true }),
    ).toHaveCount(0);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Descargar CSV' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      'contactos-prensa-e-imagenes.csv',
    );
  });
});
