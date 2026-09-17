<script lang="ts">
  import { cn } from "$ui/lib/utils";

  /**
   * Single-line chip editor for ONE plural-variant body.
   *
   * The ICU count placeholder `#` is rendered as a non-editable green chip
   * showing the form's example value (e.g. `#1`, `#10`) instead of a bare `#`,
   * like Tolgee's editor, so a designer immediately sees what the number means.
   * On the way out it serialises straight back to `#`, so the stored ICU is
   * unchanged.
   *
   * This is a contenteditable (not a textarea-with-overlay like IcuEditor)
   * precisely because the chip must DISPLAY more characters than it OCCUPIES in
   * the value — impossible with the char-for-char overlay alignment a textarea
   * needs. Modelled on keyFormatInput.svelte, minus the autocomplete.
   */
  type Props = {
    value: string;
    onChange: (value: string) => void;
    /** Text shown on the chip that stands in for `#`, e.g. "#1". */
    hashLabel: string;
    placeholder?: string;
    id?: string;
    class?: string;
  };
  let {
    value,
    onChange,
    hashLabel,
    placeholder = "",
    id,
    class: className,
  }: Props = $props();

  let editor = $state<HTMLDivElement>();
  // Guard so an external `value` change re-renders the DOM, but our OWN edits
  // (which already updated the DOM) don't wipe + reset the caret.
  let lastEmitted = "";

  // ---- value <-> DOM ---------------------------------------------------------

  function makeHashChip(): HTMLSpanElement {
    const span = document.createElement("span");
    span.contentEditable = "false";
    // Marker the serializer reads back as `#`.
    span.dataset.hash = "";
    span.textContent = hashLabel;
    span.className = "mx-0.5 select-none rounded px-1.5 py-0.5 font-medium";
    // Same green as IcuTextarea's `#` pill, so highlighting stays consistent.
    span.style.color = "#15803d";
    span.style.background = "color-mix(in srgb, #16a34a 16%, transparent)";
    span.style.boxShadow =
      "0 0 0 1px color-mix(in srgb, #16a34a 50%, transparent)";
    return span;
  }

  function renderValue(v: string): void {
    if (!editor) return;
    editor.replaceChildren();
    // Every bare `#` becomes a chip; the text between them stays editable.
    const parts = v.split("#");
    parts.forEach((part, i) => {
      if (i > 0) editor?.append(makeHashChip());
      if (part) editor?.append(document.createTextNode(part));
    });
  }

  function serialize(): string {
    if (!editor) return "";
    let out = "";
    for (const node of editor.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        out += node.textContent ?? "";
      } else if (
        node instanceof HTMLElement &&
        node.dataset.hash !== undefined
      ) {
        out += "#";
      } else {
        out += node.textContent ?? "";
      }
    }
    return out;
  }

  function emit(): void {
    const v = serialize();
    lastEmitted = v;
    onChange(v);
  }

  // Typing `#` inserts a chip at the caret instead of a literal `#`, so a
  // hand-typed count looks exactly like one that arrived from a loaded value
  // (otherwise the typed `#` stayed plain until reload).
  function insertHashChip(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor) return;
    const range = sel.getRangeAt(0);
    if (!editor.contains(range.commonAncestorContainer)) return;
    range.deleteContents();
    const chip = makeHashChip();
    range.insertNode(chip);
    range.setStartAfter(chip);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    emit();
  }

  // Mirror external value changes into the DOM (initial render + programmatic
  // changes); skip our own edits so the caret survives typing. `hashLabel` is
  // stable per instance (each variant row is keyed by name), so it never needs
  // a live refresh here.
  $effect(() => {
    const v = value;
    if (v === lastEmitted) return;
    lastEmitted = v;
    renderValue(v);
  });
</script>

<!-- min-w-0 so a flex-1 parent can shrink the field below its content width —
     the chip/text then scrolls horizontally instead of growing the row. -->
<div
  {id}
  bind:this={editor}
  role="textbox"
  tabindex={0}
  aria-label="Plural variant translation"
  contenteditable="true"
  data-placeholder={placeholder}
  spellcheck="true"
  class={cn(
    "pv-editor min-h-8 w-full min-w-0 overflow-x-auto whitespace-nowrap rounded border border-border bg-bg px-2 py-1.5 text-xs text-text transition-colors",
    "hover:border-text/30 focus:border-border-brand focus:outline-none",
    "empty:before:text-text-secondary/60 empty:before:content-[attr(data-placeholder)]",
    className,
  )}
  oninput={emit}
  onkeydown={(e) => {
    // Single-line field: never insert a hard newline.
    if (e.key === "Enter") {
      e.preventDefault();
      return;
    }
    // A typed `#` becomes a chip right away (same as a loaded value).
    if (e.key === "#") {
      e.preventDefault();
      insertHashChip();
    }
  }}
></div>

<style>
  /* Keep the field horizontally scrollable (the caret stays in view) but hide
     the scrollbar — the user navigates with the cursor, not a bar. */
  :global(.pv-editor) {
    scrollbar-width: none;
  }
  :global(.pv-editor)::-webkit-scrollbar {
    display: none;
  }
</style>
