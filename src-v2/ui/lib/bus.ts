import type { MainToUi, UiToMain } from "$shared/messages";

type Handlers = {
  [K in MainToUi["type"]]?: (
    msg: Extract<MainToUi, { type: K }>,
  ) => void | Promise<void>;
};

const handlers: Handlers = {};

export function send(msg: UiToMain): void {
  parent.postMessage({ pluginMessage: msg }, "*");
}

export function on<K extends MainToUi["type"]>(
  type: K,
  handler: (msg: Extract<MainToUi, { type: K }>) => void | Promise<void>,
): () => void {
  handlers[type] = handler as Handlers[K];
  return () => {
    delete handlers[type];
  };
}

export function attachBus(): void {
  window.addEventListener("message", async (event) => {
    const msg = event.data?.pluginMessage as MainToUi | undefined;
    if (!msg) return;
    const handler = handlers[msg.type] as
      | ((m: MainToUi) => void | Promise<void>)
      | undefined;
    if (handler) await handler(msg);
  });
}

let counter = 0;
export function nextCorrelationId(): string {
  return `c${Date.now()}-${counter++}`;
}
