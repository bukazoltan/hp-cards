import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8888',
  },
  webServer: {
    command: 'netlify dev --port 8888 -o false',
    url: 'http://localhost:8888',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
