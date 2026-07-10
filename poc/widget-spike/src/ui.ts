const apiUrl = document.getElementById("apiUrl") as HTMLInputElement;
const apiKey = document.getElementById("apiKey") as HTMLInputElement;
const lang = document.getElementById("lang") as HTMLInputElement;
const out = document.getElementById("out")!;

const log = (line: string) => {
  const ts = new Date().toISOString().split("T")[1].replace("Z", "");
  out.textContent = `[${ts}] ${line}\n` + out.textContent;
};

const send = (msg: Record<string, unknown>) => {
  parent.postMessage({ pluginMessage: msg }, "*");
};

window.addEventListener("message", (e) => {
  const data = e.data?.pluginMessage;
  if (!data) return;
  if (data.type === "SETTINGS") {
    apiUrl.value = data.apiUrl ?? "";
    apiKey.value = data.apiKey ?? "";
    lang.value = data.language ?? "en";
    log("settings loaded");
  } else if (data.type === "DONE") {
    if (data.error) {
      log(`error ${data.op}: ${data.error}`);
    } else {
      log(`${data.op} ok: ${JSON.stringify({ ...data, type: undefined, op: undefined })}`);
    }
  }
});

const wire = (id: string, handler: () => void) => {
  document.getElementById(id)!.addEventListener("click", handler);
};

wire("saveSettings", () => {
  send({
    type: "SAVE_SETTINGS",
    apiUrl: apiUrl.value.trim(),
    apiKey: apiKey.value.trim(),
    language: lang.value.trim() || "en",
  });
});

wire("pull", () => {
  log(`pull lang=${lang.value || "en"}`);
  send({ type: "PULL", language: lang.value.trim() || "en" });
});

wire("push", () => {
  log(`push lang=${lang.value || "en"}`);
  send({ type: "PUSH", language: lang.value.trim() || "en" });
});

wire("convert", () => {
  log("convert selected TEXT → widgets");
  send({ type: "CONVERT_SELECTED" });
});

wire("convertPage", () => {
  log("convert ALL TEXT on this page → widgets");
  send({ type: "CONVERT_PAGE" });
});

wire("dump", () => send({ type: "DUMP_STATES" }));
wire("bench", () => send({ type: "BENCHMARK_BUMP" }));
wire("close", () => send({ type: "CLOSE" }));

log("ready");
