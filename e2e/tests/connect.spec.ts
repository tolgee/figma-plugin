import { expect, test } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("Connect view", () => {
  test("opens Connect view for unconnected node", async ({ page }) => {
    const node = createTestNode({ text: "My label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    // Click the Link2 icon button to open the Connect view.
    await ui.getByTitle("Connect to existing key").click();

    await expect(ui.getByText("Connect to Tolgee")).toBeVisible({
      timeout: 5_000,
    });
    await expect(ui.locator("#connect-key")).toBeVisible();
  });

  test("can type a key and connect", async ({ page }) => {
    const node = createTestNode({ text: "My label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByTitle("Connect to existing key").click();
    await expect(ui.locator("#connect-key")).toBeVisible({ timeout: 5_000 });

    await ui.locator("#connect-key").fill("my-new-key");

    await ui.getByRole("button", { name: "Connect" }).click();

    // After connecting, the UI navigates back to the Index view.
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("cancels connect and returns to Index", async ({ page }) => {
    const node = createTestNode({ text: "My label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByTitle("Connect to existing key").click();
    await expect(ui.getByText("Connect to Tolgee")).toBeVisible({
      timeout: 5_000,
    });

    // The footer "Cancel" button — scope to footer to avoid matching the header Cancel.
    await ui.locator("footer").getByRole("button", { name: "Cancel" }).click();

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("shows Remove connection for connected node", async ({ page }) => {
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

    // For a connected node, click the "Connect to existing key" icon button in
    // the Index footer — this opens the Connect view for the selected node,
    // which shows the Remove connection button.
    await ui.getByRole("button", { name: "Connect to existing key" }).click();

    await expect(
      ui.getByRole("button", { name: "Remove connection" }),
    ).toBeVisible({ timeout: 5_000 });
  });

  test("Connect button is disabled when key field is empty", async ({
    page,
  }) => {
    const node = createTestNode({ text: "My label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByTitle("Connect to existing key").click();
    await expect(ui.locator("#connect-key")).toBeVisible({ timeout: 5_000 });

    // Key field starts empty — Connect should be disabled.
    await expect(
      ui.getByRole("button", { name: "Connect" }),
    ).toBeDisabled();

    // After typing a key, Connect becomes enabled.
    await ui.locator("#connect-key").fill("my.key");
    await expect(
      ui.getByRole("button", { name: "Connect" }),
    ).toBeEnabled();
  });

  test("plural toggle reveals plural parameter field", async ({ page }) => {
    const node = createTestNode({ text: "My label" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 30_000 });

    await ui.getByTitle("Connect to existing key").click();
    await expect(ui.getByText("Plural message (ICU)")).toBeVisible({
      timeout: 5_000,
    });

    // Plural parameter input is initially hidden.
    await expect(ui.locator("#connect-param")).not.toBeVisible();

    // Toggling the plural switch reveals it.
    await ui.locator("#connect-plural").click();
    await expect(ui.locator("#connect-param")).toBeVisible();
  });

  test("Remove connection disconnects node and returns to Index", async ({
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

    await ui.getByRole("button", { name: "Connect to existing key" }).click();
    await expect(
      ui.getByRole("button", { name: "Remove connection" }),
    ).toBeVisible({ timeout: 5_000 });

    await ui.getByRole("button", { name: "Remove connection" }).click();

    // After removing, the view returns to Index.
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
  });

  test("shows 'No node selected' when navigated without a node", async ({
    page,
  }) => {
    // Navigate directly to the connect route without a node in state.
    await page.goto(hostUrl(SIGNED_IN, { route: "connect" }));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByText("No node selected.")).toBeVisible({
      timeout: 10_000,
    });
  });
});
