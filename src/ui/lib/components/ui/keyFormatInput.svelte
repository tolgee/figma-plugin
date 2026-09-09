<script lang="ts" module>
  // The placeholders a key format can contain, in the order the suggestion list
  // shows them (alphabetical by label — except `instance`, kept right after
  // `component` since it's the closely related "instance of that component").
  // `token` is what goes into the format string (`{token}`) and shows on the
  // chip; `label` is the human dropdown label; `desc` is the muted hint after it.
  export type KeyPlaceholder = { token: string; label: string; desc: string };

  export const KEY_PLACEHOLDERS: KeyPlaceholder[] = [
    { token: "artboard", label: "artboard", desc: "name of the artboard frame" },
    { token: "component", label: "component", desc: "name of the nearest component" },
    { token: "instance", label: "instance", desc: "name of the nearest component instance" },
    { token: "elementName", label: "element name", desc: "name of the string" },
    { token: "elementText", label: "element text", desc: "displayed text of the string" },
    { token: "frame", label: "frame", desc: "name of the nearest frame" },
    { token: "group", label: "group", desc: "name of the nearest group" },
    { token: "section", label: "section", desc: "name of the nearest section" },
  ];
</script>

<script lang="ts">
  import { cn } from "$ui/lib/utils";

  type Props = {
    value: string;
    onChange: (value: string) => void;
    /** Called on Enter when the suggestion list is closed (e.g. submit a form). */
    onSubmit?: () => void;
    id?: string;
    placeholder?: string;
    class?: string;
  };
  let {
    value,
    onChange,
    onSubmit,
    id,
    placeholder = "",
    class: className,
  }: Props = $props();

  let editor = $state<HTMLDivElement>();
  let open = $state(false);
  let query = $state("");
  let activeIndex = $state(0);
  // Caret-anchored dropdown position, in VIEWPORT coords (fixed positioning), so
  // it always sits right under the cursor — the original plugin's main bug was
  // anchoring to the field, not the caret. Flips ABOVE the caret when there's no
  // room below (e.g. the field sits in the bottom action bar).
  let menu = $state<{ left: number; top: number | null; bottom: number | null }>(
    { left: 0, top: 0, bottom: null },
  );
  // Guard so an external `value` change re-renders the DOM, but our OWN edits
  // (which already updated the DOM) don't wipe + reset the caret.
  let lastEmitted = "";

  const filtered = $derived(
    KEY_PLACEHOLDERS.filter((p) => {
      const q = query.toLowerCase();
      return (
        !q ||
        p.token.toLowerCase().includes(q) ||
        p.label.toLowerCase().replace(/\s/g, "").includes(q)
      );
    }),
  );

  // ---- value <-> DOM ---------------------------------------------------------

  function makeChip(token: string): HTMLSpanElement {
    const span = document.createElement("span");
    span.contentEditable = "false";
    span.dataset.token = token;
    span.textContent = token;
    span.className =
      "mx-0.5 rounded bg-bg-secondary px-1.5 py-0.5 text-xs text-text";
    return span;
  }

  function renderValue(v: string): void {
    if (!editor) return;
    editor.replaceChildren();
    const re = /\{([a-zA-Z]+)\}/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(v))) {
      const token = m[1];
      if (m.index > last) {
        editor.append(document.createTextNode(v.slice(last, m.index)));
      }
      if (token) editor.append(makeChip(token));
      last = m.index + m[0].length;
    }
    if (last < v.length) editor.append(document.createTextNode(v.slice(last)));
  }

  function serialize(): string {
    if (!editor) return "";
    let out = "";
    for (const node of editor.childNodes) {
      if (node.nodeType === Node.TEXT_NODE) {
        out += node.textContent ?? "";
      } else if (node instanceof HTMLElement && node.dataset.token) {
        out += `{${node.dataset.token}}`;
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

  // Mirror external value changes into the DOM (initial render + programmatic
  // changes); skip our own edits so the caret survives typing.
  $effect(() => {
    const v = value;
    if (v === lastEmitted) return;
    lastEmitted = v;
    renderValue(v);
  });

  // ---- caret / suggestion plumbing ------------------------------------------

  // The alphabetic run immediately before a collapsed caret in a text node —
  // what we filter the suggestions by and replace when one is chosen.
  function currentWord(): { node: Text; start: number; end: number; word: string } | null {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!range.collapsed) return null;
    const node = range.startContainer;
    if (node.nodeType !== Node.TEXT_NODE) return null;
    const text = node.textContent ?? "";
    const end = range.startOffset;
    const before = text.slice(0, end);
    const match = before.match(/[a-zA-Z]+$/);
    const word = match ? match[0] : "";
    return { node: node as Text, start: end - word.length, end, word };
  }

  function updateCaretPos(): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor) return;
    const range = sel.getRangeAt(0).cloneRange();
    range.collapse(true);
    let rect = range.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) {
      // Empty text/caret → no rect; fall back to the editor's own box.
      const host = editor.getBoundingClientRect();
      rect = new DOMRect(host.left + 4, host.top, 0, host.height);
    }
    // The plugin runs in a fixed iframe — the menu can't escape the window, so
    // clamp it inside: shift left if it would overflow the right edge, and flip
    // above the caret when there's no room below (e.g. the bottom action bar).
    const MENU_W = Math.min(320, window.innerWidth * 0.9);
    const left = Math.max(
      8,
      Math.min(rect.left, window.innerWidth - MENU_W - 8),
    );
    const spaceBelow = window.innerHeight - rect.bottom;
    if (spaceBelow < 220) {
      menu = { left, top: null, bottom: window.innerHeight - rect.top + 4 };
    } else {
      menu = { left, top: rect.bottom + 4, bottom: null };
    }
  }

  function refresh(): void {
    if (document.activeElement !== editor) return;
    query = currentWord()?.word ?? "";
    activeIndex = 0;
    updateCaretPos();
    // Suggestions only while the user is TYPING a word. An always-open menu
    // (empty query matches everything) hijacked Enter/Tab on every focus —
    // pressing them mid-template inserted an unwanted chip instead of
    // submitting/leaving, silently corrupting hand-typed literal text like
    // "-test-" between placeholders.
    open = query.length > 0 && filtered.length > 0;
  }

  function insert(p: KeyPlaceholder): void {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !editor) return;
    // Replace the partial word the user was typing (if any) with the chip.
    const cw = currentWord();
    if (cw && cw.word) {
      const r = document.createRange();
      r.setStart(cw.node, cw.start);
      r.setEnd(cw.node, cw.end);
      r.deleteContents();
      sel.removeAllRanges();
      sel.addRange(r);
    }
    const chip = makeChip(p.token);
    const range = sel.getRangeAt(0);
    range.insertNode(chip);
    // Put the caret right after the inserted chip.
    range.setStartAfter(chip);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    open = false;
    query = "";
    editor.focus();
    emit();
  }

  function onKeydown(e: KeyboardEvent): void {
    if (open && filtered.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % filtered.length;
        return;
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + filtered.length) % filtered.length;
        return;
      }
      if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const p = filtered[activeIndex];
        if (p) insert(p);
        return;
      }
      if (e.key === "Escape") {
        e.preventDefault();
        open = false;
        return;
      }
    }
    // Single-line field: never insert a newline. Enter (menu closed) submits.
    if (e.key === "Enter") {
      e.preventDefault();
      onSubmit?.();
    }
  }
</script>

<!-- min-w-0 so a flex-1 parent can shrink the field below its content width —
     the chips/text then scroll horizontally instead of growing the row. -->
<div class="relative min-w-0 {className ?? ''}">
  <div
    {id}
    bind:this={editor}
    role="textbox"
    tabindex="0"
    aria-label="Key format"
    contenteditable="true"
    data-placeholder={placeholder}
    spellcheck="false"
    class={cn(
      "kf-editor min-h-8 w-full whitespace-nowrap overflow-x-auto rounded border border-border bg-bg px-2 py-1.5 font-mono text-xs text-text transition-colors",
      "hover:border-text/30 focus:border-border-brand focus:outline-none",
      "empty:before:text-text-secondary/60 empty:before:content-[attr(data-placeholder)]",
    )}
    oninput={() => {
      emit();
      refresh();
    }}
    onkeyup={(e) => {
      // Arrows/clicks move the caret without an input event → keep the menu in sync.
      if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) refresh();
    }}
    onkeydown={onKeydown}
    onmouseup={refresh}
    onfocus={refresh}
    onblur={() => setTimeout(() => (open = false), 120)}
  ></div>

  {#if open && filtered.length > 0}
    <!-- Caret-anchored (fixed → viewport coords) so it tracks the cursor and
         isn't clipped by the scrolling settings panel. mousedown is prevented so
         clicking an item doesn't blur the editor first. -->
    <ul
      class="fixed z-50 max-h-56 w-[min(20rem,90vw)] overflow-auto rounded-md border border-border bg-bg py-1 shadow-lg"
      style="left: {menu.left}px; {menu.top != null
        ? `top: ${menu.top}px`
        : `bottom: ${menu.bottom}px`};"
    >
      {#each filtered as p, i (p.token)}
        <li>
          <button
            type="button"
            class={cn(
              "flex w-full items-baseline gap-2 px-2.5 py-1 text-left",
              i === activeIndex ? "bg-bg-secondary" : "hover:bg-bg-secondary",
            )}
            onmouseenter={() => (activeIndex = i)}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => insert(p)}
          >
            <span class="font-mono text-xs text-text">{p.label}</span>
            <span class="text-[10px] italic text-text-secondary">{p.desc}</span>
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style>
  /* Keep the field horizontally scrollable (the caret stays in view as you move
     it) but hide the scrollbar — the user navigates with the cursor, not a bar. */
  :global(.kf-editor) {
    scrollbar-width: none;
  }
  :global(.kf-editor)::-webkit-scrollbar {
    display: none;
  }
</style>
