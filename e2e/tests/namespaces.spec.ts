import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

/**
 * Find the namespace <select> inside the header by its placeholder option.
 * The Select component always renders the placeholder as a disabled option,
 * so this locator is stable regardless of which namespace is currently selected.
 */
function headerNsSelect(ui: ReturnType<Page["frameLocator"]>) {
  return ui
    .locator("header")
    .locator("select")
    .filter({ has: ui.locator("option[disabled]").filter({ hasText: "Namespace" }) });
}

test.describe("Namespace feature — header dropdown", () => {
  test("namespace dropdown is visible in header when project has namespaces enabled", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    await expect(headerNsSelect(ui)).toBeVisible();
  });

  test("namespace dropdown lists namespaced and translation namespaces", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    const ns = headerNsSelect(ui);
    // Both named namespaces imported by the E2E seed must appear as options.
    await expect(ns.locator('option[value="namespaced"]')).toBeAttached();
    await expect(ns.locator('option[value="translation"]')).toBeAttached();
  });

  test("namespace dropdown reflects the namespace from config", async ({
    page,
  }) => {
    const configWithNs = { ...SIGNED_IN, namespace: "namespaced" };
    await page.goto(hostUrl(configWithNs));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    // The select must show the pre-configured namespace, not the placeholder.
    await expect(headerNsSelect(ui)).toHaveValue("namespaced");
  });

  test("selecting a namespace in header updates the active namespace", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    const ns = headerNsSelect(ui);

    // Starting state: no namespace selected (placeholder shown, value="").
    await expect(ns).toHaveValue("");

    // Selecting "namespaced" sends save-config → config-changed round-trip.
    await ns.selectOption("namespaced");

    // The select must reflect the new selection after the host echoes back.
    await expect(ns).toHaveValue("namespaced");
  });

  test("namespace dropdown absent when project has namespaces disabled", async ({
    page,
  }) => {
    // Intercept the project-meta call to report useNamespaces=false so the UI
    // keeps namespaces disabled even though the real project has them enabled.
    await page.route(
      (url) => url.pathname === "/v2/projects/2",
      async (route) => {
        const real = await route.fetch();
        const body = await real.json();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...body, useNamespaces: false }),
        });
      },
      { times: 1 },
    );

    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    // With namespacesEnabled=false the header must not render the namespace select.
    await expect(headerNsSelect(ui)).not.toBeVisible();
  });
});

test.describe("Namespace feature — Settings / Project tab", () => {
  test("Settings Project tab shows namespace selector when namespaces are enabled", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByRole("button", { name: "Open settings", exact: true }).click();
    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 5_000,
    });

    await ui.getByRole("tab", { name: "Project" }).click();

    await expect(ui.locator("#settings-namespace")).toBeVisible();
    await expect(ui.getByText("Default namespace", { exact: true })).toBeVisible();
  });

  test("Settings Project namespace selector lists default and named namespaces", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByRole("button", { name: "Open settings", exact: true }).click();
    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 5_000,
    });
    await ui.getByRole("tab", { name: "Project" }).click();

    const select = ui.locator("#settings-namespace");
    await expect(
      select.locator("option").filter({ hasText: "(default namespace)" }),
    ).toBeAttached();
    await expect(select.locator('option[value="namespaced"]')).toBeAttached();
    await expect(select.locator('option[value="translation"]')).toBeAttached();
  });

  test("Settings Project tab hides namespace selector when namespaces disabled", async ({
    page,
  }) => {
    // Force the project meta to report namespaces as disabled.
    await page.route(
      (url) => url.pathname === "/v2/projects/2",
      async (route) => {
        const real = await route.fetch();
        const body = await real.json();
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ ...body, useNamespaces: false }),
        });
      },
      { times: 1 },
    );

    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    await ui.getByRole("button", { name: "Open settings", exact: true }).click();
    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 5_000,
    });
    await ui.getByRole("tab", { name: "Project" }).click();

    // Namespace selector must not be rendered when the feature is off.
    await expect(ui.locator("#settings-namespace")).not.toBeVisible();
    await expect(ui.getByText("Default namespace")).not.toBeVisible();
  });
});

test.describe("Namespace feature — Connect view", () => {
  test("namespace field is always visible in Connect view", async ({ page }) => {
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

    // The namespace input must always be present in the Connect form,
    // regardless of whether namespacesEnabled is true or false.
    await expect(ui.locator("#connect-ns")).toBeVisible();
    await expect(ui.getByText("Namespace")).toBeVisible();
  });

  test("Connect view prefills namespace from node.ns", async ({ page }) => {
    const node = createTestNode({
      text: "On the road",
      key: "on-the-road-title",
      ns: "namespaced",
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

    // Use CSS attribute selector to bypass ARIA accessible-name computation:
    // the Link2 SVG contributes an accessible name from its internal <title>,
    // which makes getByTitle() miss the button. [title="..."] matches the raw attribute.
    await ui.locator('button[title="Connect to existing key"]').click();
    await expect(ui.getByText("Connect to Tolgee")).toBeVisible({
      timeout: 5_000,
    });

    // The namespace field must be pre-filled with the node's existing namespace.
    await expect(ui.locator("#connect-ns")).toHaveValue("namespaced");
  });

  test("Connect with explicit namespace stores ns on the node", async ({
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

    await ui.locator("#connect-key").fill("my-namespaced-key");
    await ui.locator("#connect-ns").fill("my-namespace");
    await ui.getByRole("button", { name: "Connect" }).click();

    // After connecting, the Index view shows the key with its namespace prefix.
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
    await expect(ui.getByText("my-namespace.my-namespaced-key")).toBeVisible();
  });

  test("Connect without namespace leaves ns empty on the node", async ({
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

    // Leave ns empty (default state) and connect.
    await ui.locator("#connect-key").fill("just-a-key");
    await ui.getByRole("button", { name: "Connect" }).click();

    // The node row shows only the key name (no "ns." prefix).
    await expect(ui.getByText("1 selected")).toBeVisible({ timeout: 5_000 });
    await expect(ui.getByText("just-a-key")).toBeVisible();
  });
});

test.describe("Namespace feature — key search results", () => {
  test("search results show namespace label for keys in a named namespace", async ({
    page,
  }) => {
    const node = createTestNode({ text: "This is a key in namespace" });
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

    // "this_is_a_key" exists in both default and "namespaced" namespace.
    // The result from the "namespaced" namespace must show the namespace label.
    await ui.getByPlaceholder("Search existing keys…").fill("this_is_a_key");

    // Wait for the result list to appear (300 ms debounce + API call).
    await expect(ui.getByRole("button", { name: /this_is_a_key/ }).first()).toBeVisible({
      timeout: 10_000,
    });

    // At least one result must show the "namespaced" namespace label beneath it.
    await expect(ui.getByText("namespaced")).toBeVisible();
  });

  test("search results omit namespace label for keys in the default namespace", async ({
    page,
  }) => {
    const node = createTestNode({ text: "On the road" });
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

    // "on-the-road-title" exists in both the default and "translation" namespace.
    // We verify that the default-namespace result row has no namespace label div.
    await ui.getByPlaceholder("Search existing keys…").fill("on-the-road-title");

    // Wait for results to appear (multiple results are expected).
    await expect(
      ui.getByRole("button", { name: /on-the-road-title/ }).first(),
    ).toBeVisible({ timeout: 10_000 });

    // Find the <li> that contains "on-the-road-title" but has no namespace label.
    // The default-namespace result renders only the key name div; named-namespace
    // results additionally render a second div with the namespace string.
    const defaultNsResult = ui
      .locator("li")
      .filter({ has: ui.locator("div").filter({ hasText: /^on-the-road-title$/ }) })
      .filter({ hasNot: ui.locator("div").filter({ hasText: /^translation$/ }) })
      .filter({ hasNot: ui.locator("div").filter({ hasText: /^namespaced$/ }) });

    await expect(defaultNsResult).toBeVisible();
  });

  test("selecting a namespaced search result fills key and namespace fields", async ({
    page,
  }) => {
    const node = createTestNode({ text: "Something" });
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

    // Search and select the "namespaced" variant of this_is_a_key.
    await ui.getByPlaceholder("Search existing keys…").fill("this_is_a_key");
    await expect(ui.getByText("namespaced")).toBeVisible({ timeout: 10_000 });

    // Click the result that has the "namespaced" namespace label.
    const namespacedResult = ui
      .locator("li")
      .filter({ has: ui.getByText("namespaced") })
      .getByRole("button");
    await namespacedResult.click();

    // After clicking, the key field must be populated.
    await expect(ui.locator("#connect-key")).toHaveValue("this_is_a_key");
    // And the namespace field must be populated with "namespaced".
    await expect(ui.locator("#connect-ns")).toHaveValue("namespaced");
  });
});
