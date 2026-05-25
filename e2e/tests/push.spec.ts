import { expect, test } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("Push view", () => {
  test("navigates to Push view from Index", async ({ page }) => {
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    await ui.getByRole("button", { name: /Push/ }).click();

    await expect(
      ui.getByRole("heading", { name: /Push to Tolgee/ }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("shows Computing changes state while fetching diff", async ({
    page,
  }) => {
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

    await ui.getByRole("button", { name: /Push/ }).click();

    // The "Computing changes…" card is shown while the diff query is pending.
    // It may resolve quickly, so we check that it either appeared or that the
    // diff summary card (which follows it) is already present.
    await expect(
      ui
        .getByText("Computing changes…")
        .or(ui.getByText("New").and(ui.getByText("Changed"))),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("shows diff summary card after loading", async ({ page }) => {
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    await ui.getByRole("button", { name: /Push/ }).click();

    // Wait for the diff summary grid (New / Changed / Unchanged labels)
    await expect(ui.getByText("New")).toBeVisible({ timeout: 20_000 });
    await expect(ui.getByText("Changed")).toBeVisible();
    await expect(ui.getByText("Unchanged")).toBeVisible();
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    await ui.getByRole("button", { name: /Push/ }).click();
    await expect(
      ui.getByRole("heading", { name: /Push to Tolgee/ }),
    ).toBeVisible({ timeout: 5_000 });

    await ui.getByRole("button", { name: "Back" }).click();

    // Should be back at the Index view
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("Push to Tolgee button is disabled when no changes", async ({
    page,
  }) => {
    // Node translation matches what Tolgee has — diff should be all-unchanged
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    await ui.getByRole("button", { name: /Push/ }).click();

    // Wait for the diff summary to appear (diff query settled)
    await expect(ui.getByText("Unchanged")).toBeVisible({ timeout: 20_000 });

    // The "Push to Tolgee" footer button should be disabled because there are
    // no new or changed keys to push.
    const pushButton = ui.getByRole("button", { name: "Push to Tolgee" });
    await expect(pushButton).toBeDisabled();
  });
});
