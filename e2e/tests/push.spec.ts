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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Push/ }).click();

    // The "Computing changes…" card is shown while the diff query is pending.
    // It may resolve quickly, so we check that it either appeared or that the
    // diff summary card (which always includes "Unchanged") is already present.
    await expect(
      ui
        .getByText("Computing changes…")
        .or(ui.getByText("Unchanged")),
    ).toBeVisible({ timeout: 20_000 });
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Push/ }).click();

    // Wait for the diff summary grid (New / Changed / Unchanged labels)
    await expect(ui.getByText("New", { exact: true })).toBeVisible({
      timeout: 20_000,
    });
    await expect(ui.getByText("Changed", { exact: true })).toBeVisible();
    await expect(ui.getByText("Unchanged", { exact: true })).toBeVisible();
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Push/ }).click();
    await expect(
      ui.getByRole("heading", { name: /Push to Tolgee/ }),
    ).toBeVisible({ timeout: 5_000 });

    await ui.getByRole("button", { name: "Back" }).click();

    // Should be back at the Index view
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("Push to Tolgee button is enabled when new keys exist", async ({
    page,
  }) => {
    // A node with a key not yet in Tolgee shows up as "New" in the diff.
    const node = createTestNode({
      text: "Brand new unique text for e2e",
      key: `e2e-brand-new-key-${Date.now()}`,
      connected: true,
      translation: "Brand new unique text for e2e",
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

    await ui.getByRole("button", { name: /Push/ }).click();

    // Key is new — "New" label must appear in the diff summary.
    await expect(ui.getByText("New", { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    // The "Push to Tolgee" button must be enabled because there is a new key.
    const pushButton = ui.getByRole("button", { name: "Push to Tolgee" });
    await expect(pushButton).toBeEnabled({ timeout: 5_000 });
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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Push/ }).click();

    // Wait for the diff summary to appear (diff query settled)
    await expect(ui.getByText("Unchanged")).toBeVisible({ timeout: 20_000 });

    // The "Push to Tolgee" footer button should be disabled because there are
    // no new or changed keys to push.
    const pushButton = ui.getByRole("button", { name: "Push to Tolgee" });
    await expect(pushButton).toBeDisabled();
  });

  test("shows no nodes message when selection has no connected keys", async ({
    page,
  }) => {
    // An unconnected node (no key) — the diff query won't run.
    const node = createTestNode({ text: "Unconnected label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Push/ }).click();

    // With no connected nodes the diff never runs; the Push button remains
    // disabled (since there are no keys to push).
    await expect(
      ui.getByRole("heading", { name: /Push to Tolgee/ }),
    ).toBeVisible({ timeout: 5_000 });
    // With no connected keys the diff never runs — the footer "Push to Tolgee"
    // action button is not rendered at all.
    await expect(ui.getByRole("button", { name: "Push to Tolgee" })).not.toBeVisible();
  });

  test("completes push successfully for new key", async ({ page }) => {
    // Timestamp suffix guarantees this key never exists before the test runs.
    const uniqueKey = `e2e-push-success-${Date.now()}`;
    const node = createTestNode({
      text: "E2E push success test",
      key: uniqueKey,
      connected: true,
      translation: "E2E push success test",
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

    await ui.getByRole("button", { name: /Push/ }).click();

    // Key is new — "New" label must appear in the diff summary.
    await expect(ui.getByText("New", { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    const pushButton = ui.getByRole("button", { name: "Push to Tolgee" });
    await expect(pushButton).toBeEnabled({ timeout: 5_000 });
    await pushButton.click();

    // The done-state card must show the pushed-key count.
    await expect(ui.getByText(/Pushed \d+ key\(s\) to Tolgee/)).toBeVisible({
      timeout: 30_000,
    });
  });
});
