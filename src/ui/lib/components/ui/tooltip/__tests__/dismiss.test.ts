import { describe, expect, it, vi } from "vitest";
import { dismissAllTooltips, onTooltipDismiss } from "$ui/lib/components/ui/tooltip/dismiss";

describe("tooltip dismiss channel", () => {
  it("closes every registered tooltip", () => {
    // The reported symptom is a tooltip left hanging after the pointer leaves
    // the iframe, so a dismiss has to reach ALL of them, not just the last.
    const a = vi.fn();
    const b = vi.fn();
    const offA = onTooltipDismiss(a);
    const offB = onTooltipDismiss(b);

    dismissAllTooltips();

    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
    offA();
    offB();
  });

  it("stops calling a tooltip once it unsubscribes", () => {
    // `$effect` returns the unsubscribe on unmount; a leak here would call
    // into a destroyed component on every pointer exit.
    const closed = vi.fn();
    const off = onTooltipDismiss(closed);
    off();

    dismissAllTooltips();

    expect(closed).not.toHaveBeenCalled();
  });

  it("survives a subscriber that unsubscribes while being closed", () => {
    // Setting `open = false` can tear the component down synchronously, which
    // unregisters mid-iteration — over a live Set that would skip the next
    // subscriber.
    const second = vi.fn();
    // Held in an object so the callback can reach its own unsubscribe.
    const first: { off?: () => void } = {};
    first.off = onTooltipDismiss(() => first.off?.());
    const offSecond = onTooltipDismiss(second);

    expect(() => dismissAllTooltips()).not.toThrow();
    expect(second).toHaveBeenCalledTimes(1);
    offSecond();
  });

  it("is a no-op when nothing is registered", () => {
    expect(() => dismissAllTooltips()).not.toThrow();
  });
});
