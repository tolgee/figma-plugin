import { nextCorrelationId, on, send } from "$ui/lib/bus";
import { createIdleTimeout } from "$ui/lib/busRequest";

const TIMEOUT_MS = 60_000;

export type CopyPreflight = {
  textCount: number;
  layerCount: number;
  existingCopies: number;
  copyNames: string[];
};

/** Round-trip for `request-copy-preflight` (see messages.ts). Rejects on the
 *  main bus's `handler-error` for it or after `TIMEOUT_MS` of silence. */
export function requestCopyPreflight(sourcePageId?: string): Promise<CopyPreflight> {
  return new Promise((resolve, reject) => {
    const correlationId = nextCorrelationId();
    const cleanup = (): void => {
      offResult();
      offError();
      watchdog.clear();
    };
    const watchdog = createIdleTimeout(TIMEOUT_MS, () => {
      cleanup();
      reject(new Error("Timed out sizing up the page."));
    });
    const offResult = on("copy-preflight-result", (msg) => {
      if (msg.correlationId !== correlationId) return;
      cleanup();
      resolve({
        textCount: msg.textCount,
        layerCount: msg.layerCount ?? 0,
        existingCopies: msg.existingCopies,
        copyNames: msg.copyNames ?? [],
      });
    });
    const offError = on("handler-error", (msg) => {
      if (msg.forType !== "request-copy-preflight") return;
      if (msg.correlationId !== undefined && msg.correlationId !== correlationId) return;
      cleanup();
      reject(new Error("Sizing up the page failed in Figma."));
    });
    send({ type: "request-copy-preflight", correlationId, sourcePageId });
  });
}
