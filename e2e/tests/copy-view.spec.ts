import { expect, test } from "@playwright/test";
import { PAGE_COPY, createTestNode, hostUrl } from "../host/fixtures";

const IFRAME_SELECTOR = '[data-testid="plugin-iframe"]';

test.describe("CopyView", () => {
  test("shows the page name (copy) heading for pageCopy config", async ({
    page,
  }) => {
    // No explicit pageName in the fixture -> the host's default ("Page 1").
    await page.goto(hostUrl(PAGE_COPY));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(
      ui.getByRole("heading", { name: "Page 1 (copy)" }),
    ).toBeVisible({ timeout: 10_000 });
  });

  test("shows the keys info tooltip and no Download button when no language is configured", async ({
    page,
  }) => {
    await page.goto(hostUrl(PAGE_COPY));

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(
      ui.getByRole("heading", { name: "Page 1 (copy)" }),
    ).toBeVisible({ timeout: 10_000 });

    // The "Shows Tolgee keys. Doesn't sync back." explanation now lives in
    // this (i) tooltip in the header instead of a static line in the body.
    await expect(
      ui.getByRole("button", { name: "About this page" }),
    ).toBeVisible();
    await expect(
      ui.getByRole("button", { name: "Download all" }),
    ).not.toBeVisible();
  });

  test("shows the download instruction empty state and a Download button when a language is configured", async ({
    page,
  }) => {
    await page.goto(hostUrl({ ...PAGE_COPY, language: "cs" }));

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(
      ui.getByRole("heading", { name: "Page 1 (copy)" }),
    ).toBeVisible({ timeout: 10_000 });

    // Nothing selected + never downloaded this session -> the big
    // instructional EmptyState carries the message, no separate top line.
    await expect(
      ui.getByText("Download strings to Figma."),
    ).toBeVisible();
    await expect(
      ui.getByText("All, or just the selected frames."),
    ).toBeVisible();
    // Nothing selected in this fixture -> "Download all" (vs "Download" for a selection).
    await expect(
      ui.getByRole("button", { name: "Download all" }),
    ).toBeVisible();
  });

  test("Settings is reachable from a copy page context", async ({ page }) => {
    await page.goto(hostUrl(PAGE_COPY, { route: "settings" }));

    const ui = page.frameLocator(IFRAME_SELECTOR);

    await expect(ui.getByRole("heading", { name: "Settings" })).toBeVisible({
      timeout: 10_000,
    });
    await expect(ui.locator("#settings-api-url")).toBeVisible();
  });

  test("shows the selection list with connected and unconnected rows", async ({
    page,
  }) => {
    const connected = createTestNode({
      text: "Hola",
      key: "greeting",
      connected: true,
    });
    const unconnected = createTestNode({ text: "Adios", connected: false });

    await page.goto(
      hostUrl(
        { ...PAGE_COPY, language: "es" },
        {
          allNodes: [connected, unconnected],
          selectedNodes: [connected, unconnected],
          hasUserSelection: true,
        },
      ),
    );

    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(
      ui.getByRole("heading", { name: "Page 1 (copy)" }),
    ).toBeVisible({ timeout: 10_000 });

    // Count row reflects the CONNECTED subset, not just the total (see
    // CopyView's formatCountLine).
    await expect(ui.getByText("2 strings (1 connected)")).toBeVisible();
    await expect(ui.getByText("Hola")).toBeVisible();
    await expect(ui.getByText("greeting")).toBeVisible();
    await expect(ui.getByText("Adios")).toBeVisible();
    await expect(ui.getByText("Not connected")).toBeVisible();
  });

  test("staleness banner + Recreate copy appear when the source page changed", async ({
    page,
  }) => {
    // The host's default `request-copy-staleness` handler always answers
    // "no staleness" (see e2e/host/main.ts) -- capture the correlationId of
    // the check CopyView fires on mount, at the top-page level (the UI posts
    // its messages to `window.parent`), so we can push a second, "changed"
    // result for that same id. CopyView's listener reacts to every matching
    // message, not just the first, so this correctly overrides it.
    await page.addInitScript(() => {
      (window as unknown as { __stalenessCids: string[] }).__stalenessCids = [];
      window.addEventListener("message", (e) => {
        const msg = (e.data as { pluginMessage?: { type: string; correlationId: string } })
          .pluginMessage;
        if (msg?.type === "request-copy-staleness") {
          (window as unknown as { __stalenessCids: string[] }).__stalenessCids.push(
            msg.correlationId,
          );
        }
      });
    });

    await page.goto(hostUrl({ ...PAGE_COPY, language: "es" }));
    const ui = page.frameLocator(IFRAME_SELECTOR);
    await expect(
      ui.getByRole("heading", { name: "Page 1 (copy)" }),
    ).toBeVisible({ timeout: 10_000 });

    await page.waitForFunction(
      () => (window as unknown as { __stalenessCids: string[] }).__stalenessCids.length > 0,
    );
    const correlationId = await page.evaluate(
      () => (window as unknown as { __stalenessCids: string[] }).__stalenessCids.at(-1),
    );

    await page.evaluate((cid) => {
      const iframe = document.getElementById("plugin-iframe") as HTMLIFrameElement;
      iframe.contentWindow?.postMessage(
        {
          pluginMessage: {
            type: "copy-staleness-result",
            correlationId: cid,
            ok: true,
            missingCount: 1,
            removedCount: 0,
          },
        },
        "*",
      );
    }, correlationId);

    await expect(
      ui.getByText("The original page changed since this copy was made."),
    ).toBeVisible();
    await expect(
      ui.getByRole("button", { name: "Recreate copy" }),
    ).toBeVisible();
  });
});
