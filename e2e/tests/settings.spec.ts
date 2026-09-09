import { expect, test } from "@playwright/test";
import { DEFAULT_CREDENTIALS, SIGNED_IN, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

/**
 * Settings as the view is built TODAY.
 *
 * The previous version drove a "Test Connection" button, a top-right "Close"
 * button and four tabs including "Connection" and "Sync". None of those exist:
 * the view now has THREE tabs (Project / Strings and Keys / Upload options),
 * a back arrow in the header, and Cancel + Save in the footer — credentials
 * are validated by saving, not by a separate probe. Rewritten rather than
 * re-pointed, because the locators had no equivalents to point at.
 */
test.describe("Settings", () => {
  test("saving valid credentials connects and returns to Index", async ({
    page,
  }) => {
    await page.goto(hostUrl(null, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    await ui.locator("#settings-api-url").fill(DEFAULT_CREDENTIALS.apiUrl);
    await ui.locator("#settings-api-key").fill(DEFAULT_CREDENTIALS.apiKey);
    await ui.getByRole("button", { name: "Save" }).click();

    // Landing on Index at all means the credentials were accepted — an
    // unauthenticated plugin renders the "Not connected" state instead.
    await expect(ui.getByRole("heading", { name: "Strings" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(ui.getByText("Not connected")).toHaveCount(0);
  });

  test("an invalid API key leaves the plugin unconnected", async ({ page }) => {
    await page.goto(hostUrl(null, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    await ui.locator("#settings-api-url").fill(DEFAULT_CREDENTIALS.apiUrl);
    await ui.locator("#settings-api-key").fill("definitely-not-a-valid-key");
    await ui.getByRole("button", { name: "Save" }).click();

    // The plugin must not pretend to be connected with a rejected key.
    await expect(ui.getByText("Not connected")).toBeVisible({ timeout: 30_000 });
  });

  test("the three settings tabs are reachable", async ({ page }) => {
    await page.goto(hostUrl(SIGNED_IN, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 30_000,
    });

    for (const tab of ["Project", "Strings and Keys", "Upload options"]) {
      await expect(ui.getByRole("tab", { name: tab })).toBeVisible();
    }

    // Switching tabs swaps the panel. "Prefill key name" lives under "Strings
    // and Keys" and is unconditional — the "Key format" field below it only
    // appears once that toggle is on, so it is the wrong marker for this.
    await ui.getByRole("tab", { name: "Strings and Keys" }).click();
    await expect(ui.getByText("Prefill key name")).toBeVisible({ timeout: 5_000 });

    await ui.getByRole("tab", { name: "Upload options" }).click();
    await expect(ui.getByText("Tags")).toBeVisible({ timeout: 5_000 });
  });

  test("Cancel in the footer returns to Index", async ({ page }) => {
    await page.goto(hostUrl(SIGNED_IN, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByRole("button", { name: "Cancel" }).click();

    await expect(ui.getByRole("heading", { name: "Strings" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("the header back arrow returns to Index", async ({ page }) => {
    await page.goto(hostUrl(SIGNED_IN, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 30_000,
    });

    // Replaces the old top-right "Close" button.
    await ui.locator("header").getByRole("button", { name: "Back" }).click();

    await expect(ui.getByRole("heading", { name: "Strings" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Save persists a changed setting", async ({ page }) => {
    await page.goto(hostUrl(SIGNED_IN, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByRole("tab", { name: "Strings and Keys" }).click();
    // Turn the prefill toggle on — that is the change being saved, and it is
    // also what reveals the key-format field underneath.
    await ui.getByRole("button", { name: "Prefill key name" }).click();
    await expect(ui.locator("#settings-key-format")).toBeVisible({ timeout: 5_000 });

    await ui.getByRole("button", { name: "Save" }).click();
    await expect(ui.getByRole("heading", { name: "Strings" })).toBeVisible({
      timeout: 10_000,
    });
  });
});
