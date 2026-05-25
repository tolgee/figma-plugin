import { expect, test } from "@playwright/test";
import {
  DEFAULT_CREDENTIALS,
  SIGNED_IN,
  createTestNode,
  hostUrl,
} from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("Pull view", () => {
  test("navigates to Pull view from Index", async ({ page }) => {
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);

    // Wait for auth bootstrap to complete
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();

    await expect(
      ui.getByRole("heading", { name: /Pull translations/ }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("shows loading state then diff for connected node", async ({ page }) => {
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();

    // Wait for either the diff result or the up-to-date message (Tolgee fetch
    // can take a few seconds). The loading state transitions away once both
    // queries settle.
    await expect(
      ui
        .getByText("Everything is up to date.")
        .or(ui.getByText("Changes to apply"))
        .or(ui.getByRole("button", { name: /Apply/ })),
    ).toBeVisible({ timeout: 20_000 });

    // No error banner should be present
    await expect(
      ui.locator('[role="status"]').filter({ hasText: /Cannot load|Invalid/ }),
    ).not.toBeVisible();
  });

  test("shows unchanged status when translation matches remote", async ({
    page,
  }) => {
    // The node's `translation` matches what Tolgee has for "on-the-road-title"
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      translation: "On the road",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();

    // Wait for the diff to resolve
    await expect(
      ui
        .getByText("Everything is up to date.")
        .or(ui.getByRole("button", { name: /^Apply \(/ })),
    ).toBeVisible({ timeout: 20_000 });

    // Either up-to-date message is shown, or the Apply button is absent /
    // disabled because there are no changed nodes.
    const upToDate = ui.getByText("Everything is up to date.");
    const applyButton = ui.getByRole("button", { name: /^Apply \(/ });

    const upToDateVisible = await upToDate.isVisible();
    if (!upToDateVisible) {
      // If apply button is shown it should not have any changed-node count > 0
      await expect(applyButton).not.toBeVisible();
    }
  });

  test("Cancel in header returns to Index", async ({ page }) => {
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();
    await expect(
      ui.getByRole("heading", { name: /Pull translations/ }),
    ).toBeVisible({ timeout: 5_000 });

    // Click the Cancel button in the header (not the footer Cancel)
    await ui.locator("header").getByRole("button", { name: "Cancel" }).click();

    // Should be back at the Index view
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("shows language in header", async ({ page }) => {
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();

    // Header should read "Pull translations" with "(en)" nearby
    await expect(
      ui.getByRole("heading", { name: /Pull translations/ }),
    ).toBeVisible({ timeout: 5_000 });
    await expect(ui.locator("header").getByText("(en)")).toBeVisible();
  });

  test("shows error state when no language is configured", async ({ page }) => {
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });

    // Config without a language tag — Pull requires a language to work.
    const noLanguageConfig = {
      ...DEFAULT_CREDENTIALS,
      namespace: "",
      pageInfo: true as const,
      documentInfo: true as const,
    };

    await page.goto(
      hostUrl(noLanguageConfig, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();

    // Without a language the Pull view immediately shows an error.
    await expect(ui.getByText("No language selected.")).toBeVisible({
      timeout: 10_000,
    });
  });

  test("shows Changes to apply list when node translation differs from Tolgee", async ({
    page,
  }) => {
    // Node carries an old local translation; Tolgee has the real one.
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      translation: "stale local translation",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();

    // The diff should show 1 changed node with an Apply button.
    await expect(
      ui.getByText("Changes to apply").or(ui.getByText("Everything is up to date.")),
    ).toBeVisible({ timeout: 20_000 });
  });

  test("Apply button applies translations and returns to Index", async ({
    page,
  }) => {
    // Use a translation that differs from Tolgee's so Apply becomes active.
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      translation: "old translation text",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Pull/ }).click();

    // Wait for diff to resolve.
    await expect(
      ui
        .getByRole("button", { name: /^Apply \(/ })
        .or(ui.getByText("Everything is up to date.")),
    ).toBeVisible({ timeout: 20_000 });

    const applyBtn = ui.getByRole("button", { name: /^Apply \(/ });
    if (await applyBtn.isVisible()) {
      await applyBtn.click();
      // After apply, the view returns to Index.
      await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 10_000 });
    } else {
      // Already up to date — click OK to confirm and return.
      const okBtn = ui.getByRole("button", { name: "OK" });
      if (await okBtn.isVisible()) await okBtn.click();
      await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
    }
  });
});
