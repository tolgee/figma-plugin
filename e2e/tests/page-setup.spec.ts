import { expect, test } from "@playwright/test";
import { SIGNED_IN, SIGNED_IN_NO_PAGE, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("PageSetup view", () => {
  test("shows PageSetup when page is not configured", async ({ page }) => {
    await page.goto(hostUrl(SIGNED_IN_NO_PAGE));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByText("Set up this page")).toBeVisible({
      timeout: 10_000,
    });
    await expect(ui.locator("#page-setup-lang")).toBeVisible();
  });

  test("Confirm button is disabled until a language is selected", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN_NO_PAGE));

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("Set up this page")).toBeVisible({
      timeout: 10_000,
    });

    const confirmButton = ui.getByRole("button", { name: "Confirm" });

    // The select is empty until auth completes and languages are populated.
    // Check the button state: it starts disabled when no language is selected.
    await expect(confirmButton).toBeDisabled();
  });

  test("confirms and navigates to Index after selecting a language", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN_NO_PAGE));

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("Set up this page")).toBeVisible({
      timeout: 30_000,
    });

    // Wait for auth to complete and language options to be populated.
    await expect(
      ui.locator("#page-setup-lang option:not([disabled])").first(),
    ).toBeAttached({ timeout: 30_000 });

    await ui.locator("#page-setup-lang").selectOption({ index: 0 });

    const confirmButton = ui.getByRole("button", { name: "Confirm" });
    await expect(confirmButton).toBeEnabled();
    await confirmButton.click();

    // After confirming, routing moves to Index. Show "X on this page" (no nodes configured).
    await expect(ui.getByText(/\d+ (on this page|selected)/).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("fully configured document bypasses PageSetup and shows Index", async ({
    page,
  }) => {
    // SIGNED_IN has both documentInfo and pageInfo — the gate must not trigger.
    await page.goto(hostUrl(SIGNED_IN));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    // Index renders directly; PageSetup heading must NOT appear.
    await expect(ui.getByText("Set up this page")).not.toBeVisible({
      timeout: 5_000,
    });
    // Auth bootstrap may take a moment; await the push/pull buttons as proof.
    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });
  });
});
