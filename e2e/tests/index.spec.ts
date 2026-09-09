import { expect, test } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("Index view", () => {
  test("renders a connected node from the initial selection", async ({
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

    // Wait for the Index view to bootstrap. The auth bootstrap is async
    // (validateApiKey + project meta + languages), so we anchor on the
    // post-auth selection counter rather than racing it.
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    // The connected key is rendered verbatim. We avoid asserting on the
    // English translation text because the Pull-on-init flow may overwrite
    // `characters` once translations land.
    await expect(ui.getByText("on-the-road-title")).toBeVisible();
  });

  test("renders an unconnected node with an editable key input", async ({
    page,
  }) => {
    const node = createTestNode({ text: "Brand new label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    // The unconnected row shows the raw text as a clickable preview and a
    // key-name input next to it.
    await expect(ui.getByTitle("Brand new label")).toBeVisible();
    await expect(ui.getByPlaceholder("Key name")).toBeVisible();
  });

  test("unauthenticated state shows sign-in prompt and Open Settings button", async ({
    page,
  }) => {
    // No credentials — the app boots in the unauthenticated state.
    await page.goto(hostUrl(null));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    // The plugin renders a soft-prompt asking the user to configure credentials.
    await expect(
      ui.getByText("Sign in to connect this document with Tolgee."),
    ).toBeVisible({ timeout: 10_000 });
    // exact: true avoids matching the icon button with aria-label="Open settings" (lowercase)
    await expect(
      ui.getByRole("button", { name: "Open Settings", exact: true }),
    ).toBeVisible();
  });

  test("Open Settings button navigates to Settings when unauthenticated", async ({
    page,
  }) => {
    await page.goto(hostUrl(null));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(
      ui.getByRole("button", { name: "Open Settings", exact: true }),
    ).toBeVisible({ timeout: 10_000 });
    await ui.getByRole("button", { name: "Open Settings", exact: true }).click();

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 5_000,
    });
  });

  test("asks for a selection when nothing is selected", async ({
    page,
  }) => {
    const node1 = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      connected: true,
    });
    const node2 = createTestNode({
      text: "Another text",
      key: "another-key",
      connected: true,
    });

    // No selectedNodes / hasUserSelection → plugin falls back to all page nodes.
    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node1, node2],
        selectedNodes: [],
        hasUserSelection: false,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);

    // The page-wide count that used to read "N on this page" is gone: with no
    // selection the Index now asks for one instead of listing the whole page
    // (the same scoping change Download got). Assert THAT, which is the
    // behaviour there is to assert.
    await expect(ui.getByText("Select strings for translation")).toBeVisible({
      timeout: 30_000,
    });
  });

  test("shows empty state when no nodes on page or in selection", async ({
    page,
  }) => {
    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [],
        selectedNodes: [],
        hasUserSelection: false,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    // The empty state is the "pick something" prompt now — "No connected nodes
    // on this page" belonged to the page-wide listing that was removed.
    await expect(ui.getByText("Select strings for translation")).toBeVisible({
      timeout: 30_000,
    });
    await expect(ui.getByText("Pick frames or texts. Fewer runs smoother.")).toBeVisible();
  });
});
