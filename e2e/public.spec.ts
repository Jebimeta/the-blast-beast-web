import { expect, test } from '@playwright/test';
import { SEED_ARTICLE } from './support';

test.describe('Portal público', () => {
  test('la portada renderiza el destacado y las últimas noticias', async ({
    page,
  }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/The Blast Beast/);
    await expect(page.locator('main#contenido h1')).toBeVisible();
    const sections = page.getByRole('navigation', { name: 'Secciones' });
    await expect(sections).toBeVisible();
    await expect(
      sections.getByRole('link', { name: 'Inicio', exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /Metallica anuncia una gira/i }).first(),
    ).toBeVisible();
  });

  test('el detalle de un artículo muestra cuerpo, autor y fecha', async ({
    page,
  }) => {
    await page.goto(`/articulos/${SEED_ARTICLE}`);

    await expect(page.locator('main#contenido h1')).toContainText(
      'Metallica anuncia una gira europea',
    );
    await expect(page.locator('.article-body')).toContainText('Metallica');
    await expect(page.locator('main#contenido')).toContainText(
      'Redacción Blast Beast',
    );
    await expect(page.locator('time[datetime]').first()).toBeVisible();

    const related = page.getByRole('region', {
      name: 'Noticias anteriores',
    });
    await expect(related).toBeVisible();
    await expect(related.getByRole('link').first()).toBeVisible();
  });

  test('el archivo lista artículos y la categoría filtra por sección', async ({
    page,
  }) => {
    await page.goto('/articulos');
    await expect(
      page.getByRole('heading', { name: 'Todas las noticias' }),
    ).toBeVisible();
    expect(await page.locator('article').count()).toBeGreaterThanOrEqual(6);

    await page.goto('/categorias/conciertos');
    await expect(
      page.getByRole('heading', { name: 'Conciertos', exact: true }),
    ).toBeVisible();
    expect(await page.locator('article').count()).toBeGreaterThanOrEqual(3);

    // «Noticias» es el archivo completo, no solo la categoría homónima.
    await page.goto('/categorias/noticias');
    await expect(
      page.getByRole('heading', { name: 'Noticias', exact: true }),
    ).toBeVisible();
    expect(await page.locator('article').count()).toBeGreaterThanOrEqual(6);
  });

  test('la búsqueda full-text devuelve resultados', async ({ page }) => {
    await page.goto('/buscar?q=metallica');

    await expect(
      page.getByRole('heading', { name: 'Buscar en el archivo' }),
    ).toBeVisible();
    await expect(page.locator('main#contenido')).toContainText(
      /resultados para/i,
    );
    await expect(
      page.getByRole('link', { name: /Metallica anuncia una gira/i }).first(),
    ).toBeVisible();
  });

  test('las páginas institucionales se prerenderizan', async ({ page }) => {
    for (const path of ['/sobre', '/contacto', '/privacidad']) {
      const response = await page.goto(path);
      expect(response?.status(), `${path} debe responder 200`).toBe(200);
      await expect(page.locator('main#contenido h1')).toBeVisible();
    }
  });

  test('un slug inexistente devuelve 404 real en SSR', async ({ page }) => {
    const response = await page.goto('/esta-ruta-no-existe');

    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: /Te has salido/i }),
    ).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      /noindex/,
    );
  });

  test('sitemap, robots y feed responden desde la raíz del dominio', async ({
    request,
  }) => {
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(sitemap.headers()['content-type']).toContain('xml');
    expect(await sitemap.text()).toContain(`/articulos/${SEED_ARTICLE}`);

    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap:');

    const feed = await request.get('/feed.xml');
    expect(feed.status()).toBe(200);
    expect(await feed.text()).toContain('<rss');
  });
});
