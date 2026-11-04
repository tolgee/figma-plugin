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
});
