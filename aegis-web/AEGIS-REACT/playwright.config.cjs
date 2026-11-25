const { defineConfig } = require('playwright/test')

module.exports = defineConfig({
  testDir: './tests',
  testMatch: 'ui-05.visual.spec.cjs',
  timeout: 600_000,
  globalTimeout: 900_000,
  expect: {
    timeout: 12_000,
    toHaveScreenshot: {
      animations: 'disabled',
      maxDiffPixelRatio: 0.003,
      threshold: 0.15,
    },
  },
  snapshotPathTemplate: '../../docs/ui-audit/after/ui-04/{arg}{ext}',
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    actionTimeout: 15_000,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 5173 --strictPort',
    url: 'http://127.0.0.1:5173/',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
