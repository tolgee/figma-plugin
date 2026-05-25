import { expect, test } from "@playwright/test";
import { PAGE_COPY, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("CopyView", () => {
  test("shows Copy page heading for pageCopy config", async ({ page }) => {
    await page.goto(hostUrl(PAGE_COPY));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Copy page" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows info message about generated copy", async ({ page }) => {
    await page.goto(hostUrl(PAGE_COPY));

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByRole("heading", { name: "Copy page" })).toBeVisible({
      timeout: 10_000,
    });

    await expect(
      ui.getByText("This page is a generated copy"),
    ).toBeVisible();
  });

  test("shows raw keys message when no language configured", async ({
    page,
  }) => {
    await page.goto(hostUrl(PAGE_COPY));

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByRole("heading", { name: "Copy page" })).toBeVisible({
      timeout: 10_000,
    });

    await expect(
      ui.getByText("Showing Tolgee keys instead of translated text."),
    ).toBeVisible();
  });

  test("Settings is reachable from a copy page context", async ({ page }) => {
    await page.goto(hostUrl(PAGE_COPY, { route: "settings" }));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(ui.locator("#settings-api-url")).toBeVisible();
  });
});
