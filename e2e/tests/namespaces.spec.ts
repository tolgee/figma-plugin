import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

/**
 * Namespace behaviour as the plugin presents it TODAY.
 *
 * This file used to drive a namespace <select> in the header and namespace/key
 * inputs in the Connect view (`#connect-ns`, `#connect-key`). Neither exists
 * any more: the header select was removed in ba90c02 and the picker moved onto
 * the rows and the bulk "Set namespace" action, while Connect became
 * search-driven. Those tests asserted a design that is gone, so they are
 * replaced rather than repaired — the surfaces below are where a namespace is
 * actually visible now.
 */

/** Report `useNamespaces: false` for the whole run — the project the E2E seed
 *  creates has them enabled, so this is the only way to reach the off state.
 *  UNBOUNDED: the plugin re-reads project meta, and a `{ times: 1 }` intercept
 *  let later calls fall through to the real (enabled) value. */
async function mockNamespacesDisabled(page: Page): Promise<void> {
  await page.route(
    (url) => url.pathname === "/v2/projects/2",
    async (route) => {
      try {
        const real = await route.fetch();
        const body = await real.json();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...body, useNamespaces: false }),
        });
      } catch {
        // Polled endpoint — a request can outlive the test.
      }
    },
  );
}

test.describe("Namespaces — Settings", () => {
  test("Project tab offers a default-namespace field when namespaces are enabled", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 30_000,
    });

    // A free-text input with autocomplete now, not a dropdown of options.
    await expect(ui.locator("#settings-namespace")).toBeVisible();
    await expect(ui.getByText("Default namespace")).toBeVisible();
  });

  test("Project tab hides the default-namespace field when namespaces are disabled", async ({
    page,
  }) => {
    await mockNamespacesDisabled(page);

    await page.goto(hostUrl(SIGNED_IN, { route: "settings" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 30_000,
    });

    await expect(ui.locator("#settings-namespace")).toHaveCount(0);
  });
});

test.describe("Namespaces — Connect search results", () => {
  /** Open Connect for the given node and wait for the view. */
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
    await ui.getByRole("button", { name: "Connect to key" }).click();
    await expect(ui.getByText("Connect to existing key")).toBeVisible({
      timeout: 10_000,
    });
    return ui;
  }

  test("a result in a named namespace carries its ns badge", async ({ page }) => {
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    // The E2E seed imports keys under a "namespaced" namespace.
    await ui.getByPlaceholder("Search by string (key)…").fill("namespaced");

    await expect(ui.getByText("ns:namespaced").first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("a result in the default namespace says so explicitly", async ({ page }) => {
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    await ui.getByPlaceholder("Search by string (key)…").fill("on-the-road");

    // Display-only marker: the plugin spells out "<none>" rather than leaving
    // the namespace blank, so a default-namespace key can't be mistaken for a
    // key whose namespace merely failed to load.
    await expect(ui.getByText("ns:<none>").first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test("no ns badge at all when the project has namespaces disabled", async ({
    page,
  }) => {
    await mockNamespacesDisabled(page);
    const ui = await openConnect(page, createTestNode({ text: "Anything" }));

    await ui.getByPlaceholder("Search by string (key)…").fill("on-the-road");

    // Wait for results, then assert the badge is absent rather than racing it.
    await expect(ui.getByRole("button", { name: "Connect" }).first()).toBeVisible({
      timeout: 20_000,
    });
    await expect(ui.getByText(/^ns:/)).toHaveCount(0);
  });
});

test.describe("Namespaces — Index rows", () => {
  test("an unconnected row exposes a namespace field when namespaces are enabled", async ({
    page,
  }) => {
    // The per-row picker sits on the NEW-key editor, so the node must be
    // unconnected — a connected row shows its key label instead.
    const node = createTestNode({ text: "On the road" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    // The per-row picker that replaced the header dropdown.
    await expect(ui.getByPlaceholder("Add namespace…").first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("no namespace field on a row when namespaces are disabled", async ({
    page,
  }) => {
    await mockNamespacesDisabled(page);

    const node = createTestNode({ text: "On the road" });

    await page.goto(
      hostUrl(SIGNED_IN, {
        allNodes: [node],
        selectedNodes: [node],
        hasUserSelection: true,
      }),
    );
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await expect(ui.getByPlaceholder("Add namespace…")).toHaveCount(0);
  });
});
