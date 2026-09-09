import { afterEach, describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "$ui/lib/clipboard";

// The test env is `node` (no jsdom); `navigator` is a read-only global there,
// so we install fakes with `vi.stubGlobal` (plain assignment throws).

afterEach(() => {
  vi.unstubAllGlobals();
});

/**
 * A fake `document` modelling the copy-event flow. When `fireCopyEvent` is
 * true, `execCommand("copy")` synchronously dispatches a `copy` event carrying
 * a fake `clipboardData` to the registered capture listener — so we can assert
 * the helper writes the payload itself instead of trusting the selection.
 */
function installDocument(opts: {
  fireCopyEvent: boolean;
  execThrows?: boolean;
}) {
  const listeners: Array<(e: unknown) => void> = [];
  const clipboardData = { data: null as string | null, setData(_t: string, v: string) { this.data = v; } };
  const textarea = {
    value: "",
    style: {} as Record<string, string>,
    focus: () => {},
    select: () => {},
  };
  vi.stubGlobal("document", {
    createElement: () => textarea,
    body: { appendChild: () => {}, removeChild: () => {} },
    getSelection: () => null,
    addEventListener: (_type: string, fn: (e: unknown) => void) => listeners.push(fn),
    removeEventListener: () => {},
    execCommand: vi.fn(() => {
      if (opts.execThrows) throw new Error("execCommand blocked");
      if (opts.fireCopyEvent) {
        const evt = { clipboardData, preventDefault: () => {} };
        for (const fn of listeners) fn(evt);
      }
      return true;
    }),
  });
  return { clipboardData, textarea };
}

describe("copyToClipboard", () => {
  it("writes the text into the copy event's clipboardData and returns true", async () => {
    const { clipboardData, textarea } = installDocument({ fireCopyEvent: true });
    vi.stubGlobal("navigator", {}); // no async clipboard — event path must carry it

    await expect(copyToClipboard("home.title")).resolves.toBe(true);
    // The payload came from OUR copy handler, not execCommand's return value.
    expect(clipboardData.data).toBe("home.title");
    expect(textarea.value).toBe("home.title");
  });

  it("does NOT trust execCommand's `true` when the copy event never fires", async () => {
    // The Figma-desktop case: execCommand returns true but writes nothing, and
    // there's no async clipboard to fall back to → honest failure, no throw.
    installDocument({ fireCopyEvent: false });
    vi.stubGlobal("navigator", {});

    await expect(copyToClipboard("x")).resolves.toBe(false);
  });

  it("does NOT reject when navigator.clipboard is undefined (the sandbox case)", async () => {
    installDocument({ fireCopyEvent: false });
    vi.stubGlobal("navigator", {}); // no `clipboard` property at all
    await expect(copyToClipboard("x")).resolves.toBe(false);
  });

  it("falls back to the async Clipboard API when execCommand throws", async () => {
    installDocument({ fireCopyEvent: false, execThrows: true });
    const writeText = vi.fn(() => Promise.resolve());
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyToClipboard("greeting")).resolves.toBe(true);
    expect(writeText).toHaveBeenCalledWith("greeting");
  });

  it("reports FAILURE when the async fallback rejects", async () => {
    // The reported bug: the fallback's promise was left un-awaited and success
    // returned immediately, so a `writeText` that rejected for lack of focus or
    // permission still flashed the caller's confirmation while the clipboard
    // kept its old contents.
    installDocument({ fireCopyEvent: false, execThrows: true });
    const writeText = vi.fn(() => Promise.reject(new Error("not allowed")));
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    await expect(copyToClipboard("greeting")).resolves.toBe(false);
  });

  it("returns false when nothing can copy (no event, no writeText)", async () => {
    installDocument({ fireCopyEvent: false });
    vi.stubGlobal("navigator", { clipboard: {} }); // clipboard, but no writeText
    await expect(copyToClipboard("x")).resolves.toBe(false);
  });
});
