import { expect, test } from "@playwright/test";
import { DEFAULT_CREDENTIALS, SIGNED_IN, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("Settings", () => {
  test("connects to Tolgee with valid credentials", async ({ page }) => {
    await page.goto(hostUrl(null, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    await ui.locator("#settings-api-url").fill(DEFAULT_CREDENTIALS.apiUrl);
    await ui.locator("#settings-api-key").fill(DEFAULT_CREDENTIALS.apiKey);

    await ui.getByRole("button", { name: "Test Connection" }).click();

    // Tolgee answers with the project id from the implicit API key. The
    // exact id is not stable across runs (depends on import order), so we
    // assert on the prefix only.
    await expect(ui.getByText(/^Connected to project #\d+/)).toBeVisible({
      timeout: 30_000,
    });
  });

  test("rejects an invalid API key", async ({ page }) => {
    await page.goto(hostUrl(null, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    await ui.locator("#settings-api-url").fill(DEFAULT_CREDENTIALS.apiUrl);
    await ui.locator("#settings-api-key").fill("definitely-not-a-real-key");

    await ui.getByRole("button", { name: "Test Connection" }).click();

    await expect(ui.getByText("Invalid API key.")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("Cancel button navigates back to Index", async ({ page }) => {
    // Navigate from Index after auth completes — avoids a race where the
    // init message hasn't arrived yet when Cancel is clicked immediately.
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByRole("button", { name: "Open settings", exact: true }).click();
    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 5_000,
    });

    await ui.getByRole("button", { name: "Cancel" }).click();

    // Index view shows Push/Pull buttons when authenticated.
    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Close button (top-right) navigates back to Index", async ({ page }) => {
    // Navigate from Index after auth completes — same rationale as Cancel test.
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByRole("button", { name: "Open settings", exact: true }).click();
    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 5_000,
    });

    // The top-right "Close" button is inside the Settings header.
    await ui.locator("header").getByRole("button", { name: "Close" }).click();

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("all four settings tabs are accessible", async ({ page }) => {
    await page.goto(hostUrl(null, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    });

    // Each tab should be present and clickable.
    for (const tab of ["Connection", "Project", "Sync", "Advanced"]) {
      await expect(ui.getByRole("tab", { name: tab })).toBeVisible();
    }

    // Clicking "Sync" tab should reveal its content.
    await ui.getByRole("tab", { name: "Sync" }).click();
    await expect(
      ui.getByRole("heading", { name: "Ignore strings" }),
    ).toBeVisible();

    // Clicking "Advanced" tab shows variable casing option.
    await ui.getByRole("tab", { name: "Advanced" }).click();
    await expect(ui.getByText("Variable casing")).toBeVisible();
  });

  test("Save button persists config and navigates to Index", async ({
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

    // After Save with valid credentials, the app navigates to Index.
    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });
  });
});
