import { afterEach, describe, expect, it, vi } from "vitest";
import { attachBus, on } from "$main/bus";

/**
 * The bus dispatch's error boundary. Figma discards an unhandled rejection
 * from `figma.ui.onmessage` silently, so a handler that throws used to leave
 * the UI with no response, no error, and whatever pending state it armed for
 * that request stuck until the plugin was force-quit.
 */
type FakeFigma = {
  editorType: "figma" | "dev";
  notify: ReturnType<typeof vi.fn>;
  ui: { postMessage: ReturnType<typeof vi.fn>; onmessage?: (msg: unknown) => unknown };
};

function installFigma(editorType: "figma" | "dev" = "figma"): FakeFigma {
  const figma: FakeFigma = {
    editorType,
    notify: vi.fn(),
    ui: { postMessage: vi.fn() },
  };
  (globalThis as unknown as { figma: unknown }).figma = figma;
  return figma;
}

afterEach(() => {
  (globalThis as unknown as { figma?: unknown }).figma = undefined;
  vi.restoreAllMocks();
});

describe("attachBus error boundary", () => {
  it("answers with handler-error instead of letting the rejection vanish", async () => {
    const figma = installFigma();
    vi.spyOn(console, "error").mockImplementation(() => {});
    on("request-copy-staleness", async () => {
      throw new Error("boom");
    });
    attachBus();

    await figma.ui.onmessage?.({ type: "request-copy-staleness", correlationId: "c-1" });

    const sent = figma.ui.postMessage.mock.calls.map((c) => c[0] as Record<string, unknown>);
    expect(sent).toEqual([
      { type: "handler-error", forType: "request-copy-staleness", correlationId: "c-1" },
    ]);
  });

  it("does not reject out of onmessage — Figma would swallow it", async () => {
    const figma = installFigma();
    vi.spyOn(console, "error").mockImplementation(() => {});
    on("request-copy-staleness", async () => {
      throw new Error("boom");
    });
    attachBus();

    await expect(
      figma.ui.onmessage?.({ type: "request-copy-staleness", correlationId: "c-2" }),
    ).resolves.not.toThrow();
  });

  it("tells the user something went wrong, and logs the cause", async () => {
    const figma = installFigma();
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const cause = new Error("the actual reason");
    on("request-copy-staleness", async () => {
      throw cause;
    });
    attachBus();

    await figma.ui.onmessage?.({ type: "request-copy-staleness", correlationId: "c-3" });

    expect(figma.notify).toHaveBeenCalledTimes(1);
    expect(logged).toHaveBeenCalledWith(
      "[tolgee:main] handler failed",
      "request-copy-staleness",
      cause,
    );
  });

  it("omits the correlationId when the failed request carried none", async () => {
    const figma = installFigma();
    vi.spyOn(console, "error").mockImplementation(() => {});
    on("reset", async () => {
      throw new Error("boom");
    });
    attachBus();

    await figma.ui.onmessage?.({ type: "reset" });

    const sent = figma.ui.postMessage.mock.calls[0]?.[0] as { correlationId?: string };
    expect(sent.correlationId).toBeUndefined();
  });

  it("leaves a successful handler completely alone", async () => {
    const figma = installFigma();
    const handled = vi.fn();
    on("reset", handled);
    attachBus();

    await figma.ui.onmessage?.({ type: "reset" });

    expect(handled).toHaveBeenCalledTimes(1);
    expect(figma.notify).not.toHaveBeenCalled();
    expect(figma.ui.postMessage).not.toHaveBeenCalled();
  });
});
