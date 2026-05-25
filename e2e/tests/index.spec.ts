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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

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
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    // The unconnected row shows the raw text as a clickable preview and a
    // key-name input next to it.
    await expect(ui.getByTitle("Brand new label")).toBeVisible();
    await expect(ui.getByPlaceholder("Key name")).toBeVisible();
  });
});
