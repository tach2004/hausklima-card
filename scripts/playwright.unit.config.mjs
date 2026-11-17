import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: '../.unit-tests',
  testMatch: '**/*.test.mjs',
  workers: 1,
  fullyParallel: false,
  reporter: 'list',
  timeout: 30_000,
  forbidOnly: true,
});
