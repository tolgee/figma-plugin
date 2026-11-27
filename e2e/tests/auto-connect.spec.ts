import { expect, test } from "@playwright/test";
import { SIGNED_IN, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';
const API = "http://localhost:8080/v2/projects";
const API_KEY = "examples-admin-imported-project-implicit";

test.describe("Auto-connect by exact match", () => {
  test("finds the exact key even when many other keys contain the text", async ({
    page,
    request,
  }) => {
    // Regression: auto-connect used Tolgee's fuzzy search, which returns one
    // page of 20 ordered so that the exact key can come LAST. With 25 longer
    // keys containing the same text, created first, the exact key fell outside
    // that page and the string was reported as "No exact match".
    const tag = `ac${Date.now()}`;
    const exactText = `${tag} Fibrilace síní`;
    for (let i = 0; i < 25; i++) {
      const res = await request.post(`${API}/keys/create`, {
        headers: { "X-API-Key": API_KEY },
        data: { name: `${tag}-decoy-${i}`, translations: { en: `${exactText} varianta ${i}` } },
      });
      expect(res.ok()).toBe(true);
    }
    const res = await request.post(`${API}/keys/create`, {
      headers: { "X-API-Key": API_KEY },
      data: { name: `${tag}-exact`, translations: { en: exactText } },
    });
    expect(res.ok()).toBe(true);

    const node = createTestNode({ text: exactText });
    await page.goto(
      hostUrl(SIGNED_IN, { allNodes: [node], selectedNodes: [node], hasUserSelection: true }),
    );
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: "Select string" }).first().click();
    await ui.getByRole("button", { name: "Choose operation…" }).click();
    await ui.getByRole("menuitem", { name: /Auto-connect by exact match/ }).click();
    // With namespaces on, a scope picker appears first — confirm its default.
    const ok = ui.getByRole("button", { name: "OK", exact: true });
    if (await ok.isVisible().catch(() => false)) await ok.click();

    await expect(ui.getByRole("button", { name: "Connect (1)" })).toBeEnabled({
      timeout: 20_000,
    });
  });

  test("checks many strings with a few requests to the rate-limited endpoint", async ({
    page,
    request,
  }) => {
    // Tolgee allows 100 GET /v2/projects/translations per user per 5 minutes.
    // Auto-connect must not spend one per string — it loads the project's
    // keys once (`keyIndex.ts`) and matches locally.
    // 15 is plenty to tell "a few" from "one per string" (the host page takes
    // its state from the URL, which a much larger selection would overflow).
    const nodes = Array.from({ length: 15 }, (_, i) =>
      createTestNode({ id: `rl${i}`, text: `Guard ${i}` }),
    );
    let translationsRequests = 0;
    page.on("request", (r) => {
      if (new URL(r.url()).pathname === "/v2/projects/translations") translationsRequests++;
    });
    await page.goto(hostUrl(SIGNED_IN, { allNodes: nodes, selectedNodes: nodes, hasUserSelection: true }));
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("15 strings")).toBeVisible({ timeout: 30_000 });

    await ui.getByRole("button", { name: "Select all / none" }).first().click();
    await ui.getByRole("button", { name: "Choose operation…" }).click();
    await ui.getByRole("menuitem", { name: /Auto-connect by exact match/ }).click();
    const ok = ui.getByRole("button", { name: "OK", exact: true });
    if (await ok.isVisible().catch(() => false)) await ok.click();

    await expect(ui.getByRole("button", { name: /^Connect \(\d+\)$/ })).toBeVisible({
      timeout: 20_000,
    });
    // One request per 1000 keys of the project (the index pages) plus ONE
    // newest-keys freshness request, however many strings were checked.
    const res = await request.get(`${API}/translations?size=1&languages=en`, {
      headers: { "X-API-Key": API_KEY },
    });
    const totalKeys = (await res.json()).page.totalElements as number;
    expect(translationsRequests).toBeLessThanOrEqual(Math.ceil(totalKeys / 1000) + 1);
  });

  test("sees a key a colleague created after the key list was loaded", async ({
    page,
    request,
  }) => {
    const tag = `fresh${Date.now()}`;
    const node = createTestNode({ text: `${tag} created later` });
    await page.goto(
      hostUrl(SIGNED_IN, { allNodes: [node], selectedNodes: [node], hasUserSelection: true }),
    );
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(ui.getByText("1 string")).toBeVisible({ timeout: 30_000 });

    // Load (and cache) the key list via Connect BEFORE the key exists…
    await ui.getByRole("button", { name: "Connect to key" }).click();
    await expect(ui.getByText(/matches?, best first|No matching key/).first()).toBeVisible({
      timeout: 20_000,
    });
    await ui.locator("header").getByRole("button", { name: "Back" }).click();

    // …then a colleague creates it in Tolgee.
    const res = await request.post(`${API}/keys/create`, {
      headers: { "X-API-Key": API_KEY },
      data: { name: `${tag}-key`, translations: { en: `${tag} created later` } },
    });
    expect(res.ok()).toBe(true);

    await ui.getByRole("button", { name: "Select string" }).first().click();
    await ui.getByRole("button", { name: "Choose operation…" }).click();
    await ui.getByRole("menuitem", { name: /Auto-connect by exact match/ }).click();
    const ok = ui.getByRole("button", { name: "OK", exact: true });
    if (await ok.isVisible().catch(() => false)) await ok.click();

    await expect(ui.getByRole("button", { name: "Connect (1)" })).toBeEnabled({
      timeout: 20_000,
    });
  });
});

