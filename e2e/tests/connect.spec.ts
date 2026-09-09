import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

/**
 * Connect as the view works TODAY: it SEARCHES Tolgee for an existing key and
 * connects to a result.
 *
 * The previous version drove a free-text key field (`#connect-key`), a
 * namespace field, a plural toggle, a Connect submit button and a Cancel
 * button. None of those exist — the view has a search box, a result list where
 * each row carries its own Connect/Disconnect, and a back arrow. Those tests
 * described a different screen, so they are replaced rather than re-pointed.
 */
test.describe("Connect view", () => {
  /** Open Connect from Index for `node`. */
  async function openConnect(page: Page, node: ReturnType<typeof createTestNode>) {
    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });
    if (node.connected) {
      // A connected row has no "Connect to key" action — it shows Disconnect.
      // The way in is the overflow menu.
      await ui.getByRole("button", { name: "More actions" }).first().click();
      await ui.getByText("Connection detail").click();
    } else {
      await ui.getByRole("button", { name: "Connect to key" }).click();
    }
    await expect(ui.getByText("Connect to existing key")).toBeVisible({
      timeout: 10_000,
    });
    return ui;
  }

  test("opens from an unconnected node and prompts for a search", async ({
    page,
  }) => {
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    // The search box arrives PREFILLED with the node's own text, so the view
    // opens mid-search rather than on the "Search for an existing key" prompt.
    await expect(ui.getByPlaceholder("Search by string (key)…")).toHaveValue(
      "Anything",
    );
  });

  test("the back arrow returns to Index", async ({ page }) => {
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    await ui.locator("header").getByRole("button", { name: "Back" }).click();

    await expect(ui.getByRole("heading", { name: "Strings" })).toBeVisible({
      timeout: 10_000,
    });
  });

  test("a search with no match says so instead of hanging", async ({ page }) => {
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    await ui
      .getByPlaceholder("Search by string (key)…")
      .fill("zzz-definitely-no-such-key-zzz");

    await expect(ui.getByText("No matching key in Tolgee")).toBeVisible({
      timeout: 20_000,
    });
  });

  test("a search shows results, each offering Connect", async ({ page }) => {
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    await ui.getByPlaceholder("Search by string (key)…").fill("on-the-road");

    await expect(ui.getByText("on-the-road-title").first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(ui.getByRole("button", { name: "Connect" }).first()).toBeVisible();
  });

  test("connecting to a result returns to Index with the node linked", async ({
    page,
  }) => {
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    await ui.getByPlaceholder("Search by string (key)…").fill("on-the-road");
    await ui.getByRole("button", { name: "Connect" }).first().click();

    // `connectTo` navigates straight back, and the row now carries a key. Which
    // one depends on the search order — "on-the-road" matches several — so
    // assert the node is CONNECTED rather than pinning the exact key.
    await expect(ui.getByRole("heading", { name: "Strings" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(ui.getByText(/on-the-road/).first()).toBeVisible({
      timeout: 10_000,
    });
    await expect(ui.getByRole("button", { name: "Disconnect" })).toBeVisible();
  });

  test("an already-connected key offers Disconnect", async ({ page }) => {
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });
    const ui = await openConnect(page, node);

    await ui.getByPlaceholder("Search by string (key)…").fill("on-the-road");

    // The row for the key this node already uses swaps Connect for Disconnect
    // (was "Remove connection").
    await expect(ui.getByRole("button", { name: "Disconnect" })).toBeVisible({
      timeout: 20_000,
    });
  });

  test("shows 'No node selected' when navigated without a node", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN, { route: "connect" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByText("No node selected.")).toBeVisible({
      timeout: 30_000,
    });
  });
});
