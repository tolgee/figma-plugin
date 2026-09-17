import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for the Figma-plugin v2 E2E suite.
 *
 * Bring-up sequence (also encoded in `.github/workflows/test.yml`):
 *   1. `docker compose -f e2e/docker-compose.yml up -d` — starts Tolgee
 *      with the `e2e/import-data/examples` project pre-seeded.
 *   2. `node e2e/wait-for-tolgee.mjs` — polls until the platform responds
 *      200 (Tolgee takes ~30-60s to bootstrap on a cold start).
 *   3. `pnpm build` — produces `dist/ui.html` (the single-file Svelte
 *      bundle the plugin ships to Figma).
 *   4. `vite preview --config e2e/vite.config.host.ts` (started via the
 *      `webServer` block below) — serves `e2e/host/` + `dist/`.
 *   5. Playwright runs `e2e/tests/**`.
 *
 * Locally, `pnpm e2e` performs the same dance.
 */
const CI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e/tests",
  outputDir: "./e2e/test-results",
  globalSetup: "./e2e/global-setup.ts",
  fullyParallel: true,
  forbidOnly: CI,
  retries: CI ? 2 : 2,
  timeout: 120_000,
  // Run a single worker locally for predictable Tolgee state; CI gets a
  // single worker too since all specs hit the same shared platform and we
  // do not have multi-tenant isolation in the import data.
  workers: 1,
  reporter: CI
    ? [["html", { open: "never", outputFolder: "e2e/playwright-report" }], ["github"]]
    : [["html", { open: "never", outputFolder: "e2e/playwright-report" }], ["list"]],
  use: {
    baseURL: "http://localhost:4173",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: CI ? "retain-on-failure" : "off",
  },
  projects: [
    {
      name: "chromium",
      // Figma's plugin host is Chromium-based, so we target that exclusively.
      // Cross-browser coverage is not meaningful for a plugin that only ever
      // runs inside Figma.
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "pnpm exec vite --config e2e/vite.config.host.ts",
    url: "http://localhost:4173",
    reuseExistingServer: !CI,
    stdout: "pipe",
    stderr: "pipe",
    // Vite dev startup is near-instant; the slow step is the plugin build,
    // which is run as a separate npm script before Playwright.
    timeout: 30_000,
  },
});
