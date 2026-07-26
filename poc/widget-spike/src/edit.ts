const keyInput = document.getElementById("key") as HTMLInputElement;
const translationInput = document.getElementById(
  "translation",
) as HTMLTextAreaElement;

window.addEventListener("message", (e) => {
  const data = e.data?.pluginMessage;
  if (data?.type === "INIT") {
    keyInput.value = data.key ?? "";
    translationInput.value = data.translation ?? "";
    translationInput.focus();
    translationInput.select();
  }
});

const send = (msg: Record<string, unknown>) => {
  parent.postMessage({ pluginMessage: msg }, "*");
};

document.getElementById("save")!.addEventListener("click", () => {
  send({
    type: "EDIT_SAVE",
    key: keyInput.value.trim(),
    translation: translationInput.value,
  });
});

document.getElementById("cancel")!.addEventListener("click", () => {
  send({ type: "EDIT_CANCEL" });
});

window.addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
    send({
      type: "EDIT_SAVE",
      key: keyInput.value.trim(),
      translation: translationInput.value,
    });
  } else if (e.key === "Escape") {
    send({ type: "EDIT_CANCEL" });
  }
});
