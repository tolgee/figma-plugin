import type { MainToUi, UiToMain } from "$shared/messages";
import { DEV_ALLOWED_IMPACTS, MESSAGE_IMPACT } from "$shared/messagePolicy";

type Handlers = {
  [K in UiToMain["type"]]?: (msg: Extract<UiToMain, { type: K }>) => void | Promise<void>;
};

const handlers: Handlers = {};

export function send(msg: MainToUi): void {
  figma.ui.postMessage(msg);
}

export function on<K extends UiToMain["type"]>(
  type: K,
  handler: (msg: Extract<UiToMain, { type: K }>) => void | Promise<void>,
): void {
  handlers[type] = handler as Handlers[K];
}

export function attachBus(): void {
  figma.ui.onmessage = async (msg: UiToMain) => {
    // Dev Mode is inspect-only: hard-block anything classified as a canvas
    // write (see $shared/messagePolicy — the exhaustive impact map is the
    // single defence layer, not per-call-site conditions). The UI hides the
    // affordances that send these, so reaching this guard is an anomaly
    // worth surfacing to the user, not a silent drop.
    if (figma.editorType === "dev" && !DEV_ALLOWED_IMPACTS.has(MESSAGE_IMPACT[msg.type])) {
      figma.notify("Not available in Dev Mode");
      console.warn("[tolgee:main] blocked canvas message in Dev Mode:", msg.type);
      return;
    }
    const handler = handlers[msg.type] as ((m: UiToMain) => void | Promise<void>) | undefined;
    if (handler) {
      try {
        await handler(msg);
      } catch (err) {
        // Figma drops an unhandled rejection from `onmessage` without a trace,
        // so an unwrapped throw meant the UI simply never got an answer: no
        // response, no error, and whatever pending/progress state it armed for
        // this request stayed armed until the user force-quit the plugin.
        // Individual handlers had started growing their own try/catch to work
        // around this (see `request-copy-staleness` in main.ts); the boundary
        // belongs here, once.
        console.error("[tolgee:main] handler failed", msg.type, err);
        figma.notify("Something went wrong. Please try again.");
        send({
          type: "handler-error",
          forType: msg.type,
          // Correlated requests can settle exactly the round-trip that died;
          // uncorrelated ones (e.g. the bulk-write progress bar) still get a
          // signal to clear on.
          correlationId:
            "correlationId" in msg && typeof msg.correlationId === "string"
              ? msg.correlationId
              : undefined,
        });
      }
    } else {
      // Log only the type, never the whole message — some UI→main messages
      // carry the API key (e.g. save-config), which must not leak to the console.
      console.warn("[tolgee:main] unhandled message", msg.type);
    }
  };
}
