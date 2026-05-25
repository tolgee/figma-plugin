import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

async function openCreateCopy(page: Page) {
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
  await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 60_000 });
  await ui.getByRole("button", { name: "Create page copy" }).click();
  await expect(ui.getByRole("heading", { name: "Create copy" })).toBeVisible({
    timeout: 5_000,
  });

  return ui;
}

test.describe("CreateCopy view", () => {
  test("navigates to CreateCopy from header button", async ({ page }) => {
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 60_000 });

    await ui.getByRole("button", { name: "Create page copy" }).click();

    await expect(ui.getByRole("heading", { name: "Create copy" })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("shows language mode and keys mode tabs", async ({ page }) => {
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 60_000 });

    await ui.getByRole("button", { name: "Create page copy" }).click();
    await expect(ui.getByRole("heading", { name: "Create copy" })).toBeVisible({
      timeout: 5_000,
    });

    // The view has two mode radio buttons: keys and languages
    await expect(ui.locator('input[type="radio"][value="keys"]')).toBeVisible();
    await expect(
      ui.locator('input[type="radio"][value="languages"]'),
    ).toBeVisible();
  });

  test("back arrow returns to Index", async ({ page }) => {
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 60_000 });

    await ui.getByRole("button", { name: "Create page copy" }).click();
    await expect(ui.getByRole("heading", { name: "Create copy" })).toBeVisible({
      timeout: 5_000,
    });

    await ui.getByRole("button", { name: "Back" }).click();

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("Create button is enabled in keys mode by default", async ({ page }) => {
    const ui = await openCreateCopy(page);

    // "keys" is the default mode — canSubmit = !isBusy, so Create is immediately enabled.
    const createButton = ui.getByRole("button", { name: "Create" });
    await expect(createButton).toBeEnabled({ timeout: 5_000 });
  });

  test("language mode shows language checkboxes after loading", async ({
    page,
  }) => {
    const ui = await openCreateCopy(page);

    await ui.locator('input[type="radio"][value="languages"]').click();

    // Languages are fetched from Tolgee; checkboxes appear once the list loads.
    await expect(ui.locator('input[type="checkbox"]').first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("Create button is disabled in language mode until a language is selected", async ({
    page,
  }) => {
    const ui = await openCreateCopy(page);

    await ui.locator('input[type="radio"][value="languages"]').click();

    const createButton = ui.getByRole("button", { name: "Create" });
    // canSubmit = mode === "keys" || selectedLangs.length > 0 → false in languages mode with nothing selected.
    await expect(createButton).toBeDisabled();

    // Wait for language checkboxes to load, then select one.
    const firstCheckbox = ui.locator('input[type="checkbox"]').first();
    await expect(firstCheckbox).toBeVisible({ timeout: 20_000 });
    await firstCheckbox.click();

    await expect(createButton).toBeEnabled();
  });
});
