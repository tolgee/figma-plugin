import type { MainToUi, UiToMain } from "$shared/messages";

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
    const handler = handlers[msg.type] as ((m: UiToMain) => void | Promise<void>) | undefined;
    if (handler) {
      await handler(msg);
    } else {
      // TODO: implement — no handler registered for this UiToMain type yet.
      console.log("[tolgee:main] unhandled message", msg);
    }
  };
}
