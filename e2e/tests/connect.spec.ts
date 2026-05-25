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

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

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

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

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

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    await ui.getByTitle("Connect to existing key").click();
    await expect(ui.getByText("Connect to Tolgee")).toBeVisible({
      timeout: 5_000,
    });

    // The footer "Cancel" button (role=button) — not the header Cancel link.
    await ui.getByRole("button", { name: "Cancel" }).click();

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

    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 15_000 });

    // For a connected node, clicking the key name button opens the Connect
    // view (which also allows removing the connection).
    await ui.getByTitle("on-the-road-title").click();

    await expect(
      ui.getByRole("button", { name: "Remove connection" }),
    ).toBeVisible({ timeout: 5_000 });
  });
});
