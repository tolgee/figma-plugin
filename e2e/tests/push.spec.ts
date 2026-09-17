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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

    await expect(
      ui.getByRole("heading", { name: /Upload to Tolgee/ }),
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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();
    await expect(
      ui.getByRole("heading", { name: /Upload to Tolgee/ }),
    ).toBeVisible({ timeout: 5_000 });

    await ui.getByRole("button", { name: "Back" }).click();

    // Should be back at the Index view
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 5_000 });
  });

  test("Push to Tolgee button is enabled when new keys exist", async ({
    page,
  }) => {
    // A key not yet in Tolgee counts as NEW only when the node is UNconnected.
    // A CONNECTED node whose key is absent remotely means the opposite — the
    // key was deleted on the platform — and `pushDiff` deliberately withholds
    // those rather than silently re-creating what someone removed. This
    // fixture said `connected: true`, so the diff was right to report nothing
    // to push and the button was right to stay disabled.
    const node = createTestNode({
      text: "Brand new unique text for e2e",
      key: `e2e-brand-new-key-${Date.now()}`,
      connected: false,
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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

    // Key is new — "New" label must appear in the diff summary.
    await expect(ui.getByText("New", { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    // The "Upload to Tolgee" button must be enabled because there is a new key.
    const pushButton = ui.getByRole("button", { name: "Upload to Tolgee" });
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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

    // Wait for the diff summary to appear (diff query settled)
    await expect(ui.getByText("Unchanged")).toBeVisible({ timeout: 20_000 });

    // With "Upload screenshots" on (the default) and unchanged keys present,
    // the button stays ENABLED by design — screenshots can be re-uploaded for
    // existing keys even when no text changed, matching the old plugin
    // (`screenshotOnlyUpload` in Push.svelte). Turn the toggle off to get the
    // genuinely-nothing-to-do state this test is about.
    // `CheckboxField` renders a plain <button> with the label inside (not a
    // checkbox role), so this is a click, not `.uncheck()`.
    await ui.getByRole("button", { name: "Upload screenshots" }).click();

    const pushButton = ui.getByRole("button", { name: "Upload to Tolgee" });
    await expect(pushButton).toBeDisabled();
  });

  test("shows a 'nothing to upload' message (not a spinner) when no keys are connected", async ({
    page,
  }) => {
    // An unconnected node (no key) — the diff query is gated OFF.
    const node = createTestNode({ text: "Unconnected label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

    // A disabled query still reports `isPending`, so without the empty-state
    // guard the "Computing changes…" card would spin forever. It must instead
    // show the empty-state message and never the spinner.
    await expect(ui.getByText("No connected strings to upload.")).toBeVisible({
      timeout: 10_000,
    });
    await expect(ui.getByText("Computing changes…")).not.toBeVisible();
    // The diff never runs → the footer "Upload to Tolgee" action isn't rendered.
    await expect(ui.getByRole("button", { name: "Upload to Tolgee" })).not.toBeVisible();
  });

  test("surfaces a diff error instead of an endless spinner when the fetch fails", async ({
    page,
  }) => {
    // Regression guard for fix 62: a failed diff query used to leave the
    // "Computing changes…" card spinning forever (the runes adapter swallows
    // the terminal error). It now settles to an OUTCOME and shows an error.
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });

    // The diff fetches remote keys via GET /v2/projects/translations — fail it.
    await page.route("**/v2/projects/translations**", (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
    );

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

    // The diff query settles to an error banner …
    await expect(
      ui.getByText(/Failed to fetch remote keys|Failed to compute diff/),
    ).toBeVisible({ timeout: 20_000 });

    // … and the loading card is gone (not stuck), with no push action offered.
    await expect(ui.getByText("Computing changes…")).not.toBeVisible();
    await expect(ui.getByRole("button", { name: "Upload to Tolgee" })).not.toBeVisible();
  });

  test("completes push successfully for new key", async ({ page }) => {
    // Timestamp suffix guarantees this key never exists before the test runs.
    const uniqueKey = `e2e-push-success-${Date.now()}`;
    const node = createTestNode({
      text: "E2E push success test",
      key: uniqueKey,
      // Unconnected: a connected node whose key is absent remotely reads as
      // "deleted on the platform" and is deliberately withheld from the push.
      connected: false,
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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: /Upload/ }).click();

    // Key is new — "New" label must appear in the diff summary.
    await expect(ui.getByText("New", { exact: true })).toBeVisible({
      timeout: 20_000,
    });

    const pushButton = ui.getByRole("button", { name: "Upload to Tolgee" });
    await expect(pushButton).toBeEnabled({ timeout: 5_000 });
    await pushButton.click();

    // The done state shows a success summary with the new-key count.
    await expect(ui.getByText(/Uploaded \d+ new key\(s\) to Tolgee/)).toBeVisible({
      timeout: 30_000,
    });
  });
});
