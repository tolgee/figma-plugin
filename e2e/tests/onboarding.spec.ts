import { expect, test } from "@playwright/test";
import { DEFAULT_CREDENTIALS, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

/**
 * First-run onboarding: a document that hasn't been set up yet (config exists
 * — so `init` has arrived — but has no `documentInfo`) gets the guided setup
 * wizard instead of the Index "Sign in to connect" dead-end. The wizard reuses
 * the real Settings sections; Save stamps documentInfo (host + main mirror
 * this), which clears the gate and lands on Index.
 */
test.describe("Onboarding (first-run wizard)", () => {
  test("a not-yet-configured document opens the wizard, not the Index sign-in", async ({
    page,
  }) => {
    await page.goto(hostUrl({ apiUrl: DEFAULT_CREDENTIALS.apiUrl }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    // The wizard opens on its Connection step; the stepper lists what follows.
    // (Was "Set up Tolgee" + "1/3" — neither exists; the wizard is a numbered
    // stepper mirroring the Settings tabs now.)
    await expect(ui.getByRole("heading", { name: "Connection" })).toBeVisible({
      timeout: 30_000,
    });
    await expect(ui.getByText("Strings & Keys")).toBeVisible();
    // The old dead-end is gone.
    await expect(
      ui.getByText("Sign in to connect this document with Tolgee."),
    ).not.toBeVisible();
    // Can't advance before the credentials validate.
    await expect(ui.getByRole("button", { name: /Next/ })).toBeDisabled();
  });

  test("connect → Next → Next → Save lands on Index and clears the wizard", async ({
    page,
  }) => {
    await page.goto(hostUrl({ apiUrl: DEFAULT_CREDENTIALS.apiUrl }));
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByRole("heading", { name: "Connection" })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByPlaceholder("tgpak_...").fill(DEFAULT_CREDENTIALS.apiKey);
    await ui.getByRole("button", { name: "Connect" }).click();
    // Connecting persists projectId (a config-changed echo without the unsaved
    // apiKey); the session must survive that, not get torn down.
    await expect(ui.getByText(/was successfully connected/)).toBeVisible({
      timeout: 15_000,
    });
    await expect(ui.getByRole("button", { name: /Next/ })).toBeEnabled();

    // Advance until the last step offers Save. Counting Nexts is brittle: the
    // wizard has four steps now (Connection → Project → Strings & Keys →
    // Upload options), and where it starts depends on how much of the config
    // already validated.
    const next = ui.getByRole("button", { name: /Next/ });
    for (let i = 0; i < 5 && (await next.count()) > 0; i++) {
      await next.click();
    }
    await ui.getByRole("button", { name: "Save" }).click();

    // Wizard gone, Index shown.
    await expect(
      ui.getByRole("heading", { name: "Connection" }),
    ).not.toBeVisible();
    await expect(
      ui.getByText("Select strings for translation"),
    ).toBeVisible({ timeout: 10_000 });
  });
});
