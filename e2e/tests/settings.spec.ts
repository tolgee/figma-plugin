import { expect, test } from "@playwright/test";
import { DEFAULT_CREDENTIALS, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("Settings", () => {
  test("connects to Tolgee with valid credentials", async ({ page }) => {
    // Start fresh — no config means the UI lands on the Index view's
    // "Sign in to connect this document" CTA, which routes to Settings.
    await page.goto(hostUrl(null));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    // The unauthenticated Index view exposes an explicit "Open Settings"
    // button. Wait for it (= UI bootstrapped + init handled) and click it.
    await ui.getByRole("button", { name: "Open Settings" }).click();

    // Fill the connection tab. The inputs have stable IDs already.
    await ui.locator("#settings-api-url").fill(DEFAULT_CREDENTIALS.apiUrl);
    await ui.locator("#settings-api-key").fill(DEFAULT_CREDENTIALS.apiKey);

    await ui.getByRole("button", { name: "Test Connection" }).click();

    // Tolgee answers with the project id from the implicit API key. The
    // exact id is not stable across runs (depends on import order), so we
    // assert on the prefix only.
    await expect(ui.getByText(/^Connected to project #\d+/)).toBeVisible({
      timeout: 15_000,
    });
  });

  test("rejects an invalid API key", async ({ page }) => {
    await page.goto(hostUrl(null));

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await ui.getByRole("button", { name: "Open Settings" }).click();

    await ui.locator("#settings-api-url").fill(DEFAULT_CREDENTIALS.apiUrl);
    await ui.locator("#settings-api-key").fill("definitely-not-a-real-key");

    await ui.getByRole("button", { name: "Test Connection" }).click();

    await expect(ui.getByText("Invalid API key.")).toBeVisible({
      timeout: 15_000,
    });
  });
});
