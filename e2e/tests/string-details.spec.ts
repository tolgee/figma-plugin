import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";
import type { NodeInfo } from "../../src/shared/types";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("StringDetails view", () => {
  /**
   * Shared setup helper: navigates to the Index view with a single connected
   * node and waits for the authenticated state, then opens StringDetails by
   * clicking the characters button.
   */
  async function openStringDetails(page: Page, opts: { connected?: boolean } = {}) {
    const connected = opts.connected ?? true;
    const node = createTestNode({
      text: "On the road",
      // A connected key has its plural flag LOCKED (it is changed in Tolgee),
      // so tests that toggle it must open an unconnected node.
      ...(connected ? { key: "on-the-road-title", connected: true } : {}),
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
    // The key is the VALUE of the Key textbox now, not free-standing text.
    await expect(ui.getByRole("textbox", { name: "Key" })).toHaveValue(
      "on-the-road-title",
    );
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
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 5_000 });
  });

  test("cancel returns to Index", async ({ page }) => {
    const ui = await openStringDetails(page);

    await ui.locator("footer").getByRole("button", { name: "Cancel" }).click();

    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 5_000 });
  });

  test("plural toggle reveals plural parameter input and plural editor", async ({
    page,
  }) => {
    // Unconnected: the Plural control is disabled for a connected key.
    const ui = await openStringDetails(page, { connected: false });

    // The plural editor is absent before toggling.
    await expect(ui.locator(".plural-editor")).toHaveCount(0);

    // A CheckboxField renders a <button> carrying the label, not an input with
    // an id (`#string-details-plural` never existed).
    await ui.getByRole("button", { name: "Plural" }).click();

    await expect(ui.locator(".plural-editor")).toBeVisible({ timeout: 5_000 });
  });

  test("shows 'No node selected' when navigated without a node", async ({
    page,
  }) => {
    // Navigate directly to the stringDetails route without a node in state.
    await page.goto(hostUrl(SIGNED_IN, { route: "stringDetails" }));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByText("No node selected.")).toBeVisible({
      timeout: 10_000,
    });
  });

  /**
   * Task 60: `confirm()` is a silent no-op in Figma's sandboxed plugin
   * iframe (no `allow-modals`), so the "save unsaved changes before the
   * selection switches to another node" prompt never actually asked in
   * production — replaced with an in-app Dialog. `window.__e2e.selectNodes`
   * (exposed on the HOST window, not the plugin iframe) simulates the canvas
   * selection changing out from under a dirty edit, the same trigger the old
   * `confirm()` branch handled.
   */
  function selectOnHost(page: Page, nodes: NodeInfo[]) {
    return page.evaluate((n) => {
      (window as unknown as { __e2e: { selectNodes: (nodes: unknown[]) => void } }).__e2e.selectNodes(n);
    }, nodes);
  }

  test("prompts to save unsaved changes when the selection switches to another node; Save persists the edit", async ({
    page,
  }) => {
    const nodeA = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });
    const nodeB = createTestNode({
      text: "Second string",
      key: "second-key",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [nodeA, nodeB],
        selectedNodes: [nodeA],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });
    await ui.getByTitle("On the road").click();
    await expect(ui.getByText("String details")).toBeVisible({ timeout: 5_000 });

    const textarea = ui.locator("#string-details-translation");
    await textarea.fill("Dirty edit, not saved yet");

    // The canvas selection switches to a different connected node while the
    // field above is still dirty.
    await selectOnHost(page, [nodeB]);

    await expect(ui.getByRole("heading", { name: "Unsaved changes" })).toBeVisible({ timeout: 5_000 });
    // Scope to the dialog: the view's own footer Save is on screen too, so an
    // unscoped lookup hits two buttons and trips strict mode.
    await ui.getByRole("dialog").getByRole("button", { name: "Save" }).click();

    // Dialog closes; StringDetails follows the live selection to nodeB.
    await expect(ui.getByRole("heading", { name: "Unsaved changes" })).not.toBeVisible();
    await expect(textarea).toHaveValue("Second string");

    // The edit to nodeA was actually persisted (not silently dropped).
    await expect
      .poll(() =>
        page.evaluate(
          () =>
            (window as unknown as { __e2e: { state: { allNodes: NodeInfo[] } } }).__e2e.state
              .allNodes.find((n) => n.key === "on-the-road-title")?.characters,
        ),
      )
      .toBe("Dirty edit, not saved yet");
  });

  test("Discard drops the edit instead of saving it", async ({ page }) => {
    const nodeA = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });
    const nodeB = createTestNode({
      text: "Second string",
      key: "second-key",
      connected: true,
    });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [nodeA, nodeB],
        selectedNodes: [nodeA],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });
    await ui.getByTitle("On the road").click();
    await expect(ui.getByText("String details")).toBeVisible({ timeout: 5_000 });

    await ui.locator("#string-details-translation").fill("Never saved");
    await selectOnHost(page, [nodeB]);
    await expect(ui.getByRole("heading", { name: "Unsaved changes" })).toBeVisible({ timeout: 5_000 });

    await ui.getByRole("button", { name: "Discard" }).click();

    await expect(ui.getByRole("heading", { name: "Unsaved changes" })).not.toBeVisible();
    const characters = await page.evaluate(
      () =>
        (window as unknown as { __e2e: { state: { allNodes: NodeInfo[] } } }).__e2e.state.allNodes.find(
          (n) => n.key === "on-the-road-title",
        )?.characters,
    );
    expect(characters).toBe("On the road");
  });
});
