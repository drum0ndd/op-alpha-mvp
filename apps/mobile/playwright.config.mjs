import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import { assertTestDatabase } from '../../scripts/test-environment.mjs';
assertTestDatabase(process.env.DATABASE_URL);
if (process.env.OPALPHA_TEST_RUN !== '1') throw new Error('Execute corepack pnpm test:app.');
const root = fileURLToPath(new URL('../../', import.meta.url));
export default defineConfig({
  testDir: './e2e', fullyParallel: false, workers: 1, retries: 0, timeout: 30000,
  reporter: [['list'], ['html', { outputFolder: '../../playwright-report', open: 'never' }]],
  outputDir: '../../test-results/browser',
  use: { baseURL: 'http://127.0.0.1:8082', trace: 'retain-on-failure', screenshot: 'only-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1366, height: 900 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], defaultBrowserType: 'chromium' } },
  ],
  webServer: [
    { command: 'node apps/api/dist/main.js', cwd: root, url: 'http://127.0.0.1:3334/v1/health/ready', reuseExistingServer: false, timeout: 30000 },
    { command: 'node scripts/serve-test-web.mjs', cwd: root, url: 'http://127.0.0.1:8082', reuseExistingServer: false, timeout: 30000 },
  ],
});
