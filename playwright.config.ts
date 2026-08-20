import { defineConfig, devices } from '@playwright/test';

/* BUILD_SPEC v3.0 §12 — several acceptance criteria ("only one gallery image
 * is requested at 375px", "contrast sampled on rendered pixels", "total
 * homepage scroll ≤ 900vh") can only be checked in a real browser. This config
 * exists for those checks; nothing here ships to the client bundle.
 *
 * §1 non-negotiable 1: mobile is the PRIMARY project, listed first. */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:3000',
    trace: 'off',
    screenshot: 'off',
  },
  projects: [
    {
      name: 'mobile-375',
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 812 } },
    },
    {
      name: 'tablet-768',
      use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 1024 } },
    },
    {
      name: 'desktop-1280',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://127.0.0.1:3000/en',
    reuseExistingServer: true,
    timeout: 180_000,
  },
});
