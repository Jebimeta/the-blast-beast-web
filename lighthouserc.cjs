const baseUrl = process.env.E2E_BASE_URL ?? 'http://localhost:8088';
const article = 'metallica-anuncia-gira-europea-2027';

module.exports = {
  ci: {
    collect: {
      url: [
        `${baseUrl}/`,
        `${baseUrl}/articulos`,
        `${baseUrl}/articulos/${article}`,
        `${baseUrl}/sobre`,
      ],
      // Lighthouse tiene mucha varianza entre ejecuciones (arranque en frío de
      // SSR, API y cachés). Con 3 pasadas y mediana evitamos que un pico
      // puntual decida el resultado sin maquillar una regresión real.
      numberOfRuns: 3,
      settings: {
        // Emulación móvil con throttling simulado (4G), como Lighthouse por defecto.
        formFactor: 'mobile',
        screenEmulation: {
          mobile: true,
          width: 412,
          height: 823,
          deviceScaleFactor: 1.75,
          disabled: false,
        },
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      aggregationMethod: 'median',
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.95 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'reports/lighthouse',
    },
  },
};
