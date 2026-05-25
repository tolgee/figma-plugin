import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("StringDetails view", () => {
  /**
   * Shared setup helper: navigates to the Index view with a single connected
   * node and waits for the authenticated state, then opens StringDetails by
   * clicking the characters button.
   */
  async function openStringDetails(page: Page) {
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

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    // The characters button has `title={node.characters}` in NodeListItem.
    await ui.getByTitle("On the road").click();

    await expect(ui.getByText("String details")).toBeVisible({
      timeout: 5_000,
    });

    return ui;
  }

  test("opens StringDetails when clicking on node text", async ({ page }) => {
    const ui = await openStringDetails(page);
    await expect(ui.getByText("String details")).toBeVisible();
  });

  test("shows key name in StringDetails", async ({ page }) => {
    const ui = await openStringDetails(page);
    // The key is rendered as plain text inside a <p> element.
    await expect(ui.getByText("on-the-road-title")).toBeVisible();
  });

  test("shows translation textarea", async ({ page }) => {
    const ui = await openStringDetails(page);

    const textarea = ui.locator("#string-details-translation");
    await expect(textarea).toBeVisible();
    await expect(textarea).toHaveValue("On the road");
  });

  test("can edit and save translation", async ({ page }) => {
    const ui = await openStringDetails(page);

    const textarea = ui.locator("#string-details-translation");
    await textarea.fill("Updated translation text");

    await ui.getByRole("button", { name: "Save" }).click();

    // After saving, the UI navigates back to the Index view.
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("cancel returns to Index", async ({ page }) => {
    const ui = await openStringDetails(page);

    await ui.getByRole("button", { name: "Cancel" }).click();

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });
});
