import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

const MOCK_BRANCHES = ["main", "develop", "feature/new-ui"];

/**
 * Find the branch <select> inside the header by its placeholder option.
 * The Select component always renders the placeholder as a disabled option,
 * so this locator is stable regardless of which branch is currently selected.
 */
function headerBranchSelect(ui: ReturnType<Page["frameLocator"]>) {
  return ui
    .locator("header")
    .locator("select")
    .filter({ has: ui.locator("option[disabled]").filter({ hasText: "Branch" }) });
}

/**
 * Set up route intercepts that make the plugin believe branching is enabled
 * and that the given list of branches is available from the API.
 *
 * - Patches GET /v2/projects/2 → useBranching: true
 * - Stubs  GET /v2/projects/branches → returns the supplied branch list
 */
async function mockBranchingEnabled(
  page: Page,
  branches: string[] = MOCK_BRANCHES,
): Promise<void> {
  await page.route(
    (url) => url.pathname === "/v2/projects/2",
    async (route) => {
      const real = await route.fetch();
      const body = await real.json();
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ ...body, useBranching: true }),
      });
    },
    { times: 1 },
  );

  await page.route(
    (url) => url.pathname === "/v2/projects/branches",
    async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          _embedded: {
            branches: branches.map((name, i) => ({ name, active: i === 0 })),
          },
          page: {
            size: 20,
            totalElements: branches.length,
            totalPages: 1,
            number: 0,
          },
        }),
      });
    },
    { times: 1 },
  );
}

// ---------------------------------------------------------------------------
// Branch feature: branching DISABLED (real project, useBranching=false)
// ---------------------------------------------------------------------------

test.describe("Branch feature — branching disabled", () => {
  test("branch dropdown absent in header when project has branching disabled", async ({
    page,
  }) => {
    // The E2E project is seeded with useBranching=false. No mocking needed.
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    // The branch select must not appear at all.
    await expect(headerBranchSelect(ui)).not.toBeVisible();
  });

  test("language and namespace selects visible but no branch select when branching disabled", async ({
    page,
  }) => {
    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    // Language dropdown must be present.
    const langSelect = ui
      .locator("header")
      .locator("select")
      .filter({ has: ui.locator("option[disabled]").filter({ hasText: "Language" }) });
    await expect(langSelect).toBeVisible();

    // Namespace dropdown must be present (project has useNamespaces=true).
    const nsSelect = ui
      .locator("header")
      .locator("select")
      .filter({ has: ui.locator("option[disabled]").filter({ hasText: "Namespace" }) });
    await expect(nsSelect).toBeVisible();

    // Branch dropdown must NOT be present.
    await expect(headerBranchSelect(ui)).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Branch feature: branching ENABLED (mocked project meta + mocked branches)
// ---------------------------------------------------------------------------

test.describe("Branch feature — branching enabled", () => {
  test("branch dropdown hidden when branchingEnabled=true but no branches available", async ({
    page,
  }) => {
    // Enable branching but return an empty branch list so branchOptions=[].
    await mockBranchingEnabled(page, []);

    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    // With branchingEnabled=true but no branches from the API the dropdown
    // must remain hidden (the {#if branchingEnabled && branchOptions.length>0}
    // guard prevents rendering).
    await expect(headerBranchSelect(ui)).not.toBeVisible();
  });

  test("branch dropdown visible when branches are available", async ({
    page,
  }) => {
    await mockBranchingEnabled(page, MOCK_BRANCHES);

    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    // With branches returned from the API the dropdown must be visible.
    await expect(headerBranchSelect(ui)).toBeVisible({ timeout: 10_000 });
  });

  test("branch dropdown lists all branches from the API", async ({ page }) => {
    await mockBranchingEnabled(page, MOCK_BRANCHES);

    await page.goto(hostUrl(SIGNED_IN));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    const branchSel = headerBranchSelect(ui);
    await expect(branchSel).toBeVisible({ timeout: 10_000 });

    for (const branch of MOCK_BRANCHES) {
      await expect(branchSel.locator(`option[value="${branch}"]`)).toBeAttached();
    }
  });

  test("branch dropdown shows current branch from config as selected", async ({
    page,
  }) => {
    await mockBranchingEnabled(page, MOCK_BRANCHES);

    const configWithBranch = { ...SIGNED_IN, branch: "develop" };
    await page.goto(hostUrl(configWithBranch));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    // The select must reflect the pre-configured branch.
    await expect(headerBranchSelect(ui)).toHaveValue("develop", {
      timeout: 10_000,
    });
  });

  test("branch dropdown adds current branch as option even when absent from API list", async ({
    page,
  }) => {
    // The API returns only ["main", "develop"] but the config already has a
    // branch "hotfix/123" that is not in that list. The Header component must
    // inject the missing value so the select does not show a blank selection.
    await mockBranchingEnabled(page, ["main", "develop"]);

    const configWithUnknownBranch = { ...SIGNED_IN, branch: "hotfix/123" };
    await page.goto(hostUrl(configWithUnknownBranch));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    const branchSel = headerBranchSelect(ui);
    await expect(branchSel).toBeVisible({ timeout: 10_000 });

    // "hotfix/123" must be present as an option and selected.
    await expect(
      branchSel.locator('option[value="hotfix/123"]'),
    ).toBeAttached();
    await expect(branchSel).toHaveValue("hotfix/123");
  });

  test("selecting a different branch updates the branch in the header", async ({
    page,
  }) => {
    await mockBranchingEnabled(page, MOCK_BRANCHES);

    const configWithBranch = { ...SIGNED_IN, branch: "main" };
    await page.goto(hostUrl(configWithBranch));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    const branchSel = headerBranchSelect(ui);
    await expect(branchSel).toHaveValue("main", { timeout: 10_000 });

    // Selecting "develop" triggers set-branch → host echoes config-changed.
    await branchSel.selectOption("develop");

    // The select must reflect the new branch after the host round-trip.
    await expect(branchSel).toHaveValue("develop");
  });

  test("selecting the already-active branch leaves the header unchanged", async ({
    page,
  }) => {
    await mockBranchingEnabled(page, MOCK_BRANCHES);

    const configWithBranch = { ...SIGNED_IN, branch: "main" };
    await page.goto(hostUrl(configWithBranch));
    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("button", { name: /Push/ })).toBeVisible({
      timeout: 30_000,
    });

    const branchSel = headerBranchSelect(ui);
    await expect(branchSel).toHaveValue("main", { timeout: 10_000 });

    // Re-selecting the current branch must not trigger a navigation or state change.
    // handleBranchChange guards with `if (!v || v === branch) return`.
    await branchSel.selectOption("main");

    // The value must still be "main" — no side-effects.
    await expect(branchSel).toHaveValue("main");
  });
});
