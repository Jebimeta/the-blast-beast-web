import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Artículo publicado por el seed de desarrollo. */
export const SEED_ARTICLE = 'metallica-anuncia-gira-europea-2027';

export const ADMIN_EMAIL =
  process.env['E2E_ADMIN_EMAIL'] ?? 'redaccion@theblastbeast.com';
export const ADMIN_PASSWORD =
  process.env['E2E_ADMIN_PASSWORD'] ?? 'Redaccion2026!';

/** Inicia sesión en el panel con el usuario del seed. */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.getByLabel('Correo').fill(ADMIN_EMAIL);
  await page.getByLabel('Contraseña').fill(ADMIN_PASSWORD);
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(/\/admin\/articulos$/);
  await expect(
    page.getByRole('heading', { name: 'Panel editorial' }),
  ).toBeVisible();
}

/**
 * Ejecuta axe con las reglas WCAG 2.1 AA y falla mostrando las violaciones
 * concretas (regla, impacto y selectores) en lugar de un array opaco.
 */
export async function expectNoAxeViolations(
  page: Page,
  label: string,
): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const violations = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => node.target.join(' ')),
  }));

  expect(violations, `Violaciones de accesibilidad en ${label}`).toEqual([]);
}
