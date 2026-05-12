<script lang="ts">
  import { tokenize, type Token } from "$ui/lib/logic/tolgeeFormat";

  type Props = {
    value: string;
    onChange?: (next: string) => void;
    /** True when editing a plural variant body — bare `#` is highlighted. */
    nested?: boolean;
    placeholder?: string;
    rows?: number;
    class?: string;
    id?: string;
    disabled?: boolean;
  };

  let {
    value = $bindable(""),
    onChange,
    nested = false,
    placeholder = "",
    rows = 3,
    class: className = "",
    id,
    disabled = false,
  }: Props = $props();

  let preEl = $state<HTMLPreElement | undefined>();
  let textareaEl = $state<HTMLTextAreaElement | undefined>();

  const highlighted = $derived(renderHighlight(tokenize(value, nested)));

  function escapeHtml(s: string): string {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /**
   * Render one token as an HTML string.
   *
   * For `variable` and `tag` tokens we hide the structural characters (`{`,
   * `}`, `<`, `>`, `/`) using `color: transparent` on child spans so only the
   * meaningful content (parameter name, tag name) is readable inside the pill.
   * The characters remain in the DOM — the layout stays byte-for-byte identical
   * to the raw textarea value, which is mandatory for the overlay to align.
   */
  function renderToken(t: Token): string {
    const esc = escapeHtml(t.text);

    switch (t.kind) {
      case "variable": {
        // Braced placeholders like `{name}` — hide `{` and `}`.
        // Parameter names inside plural structures arrive WITHOUT braces
        // and are just coloured normally.
        if (t.text.startsWith("{") && t.text.endsWith("}") && esc.length >= 2) {
          const inner = esc.slice(1, -1);
          return `<span class="tok-var"><span class="tok-inv">{</span>${inner}<span class="tok-inv">}</span></span>`;
        }
        return `<span class="tok-var">${esc}</span>`;
      }

      case "tag": {
        // HTML tags like `<strong>`, `</strong>`, `<br/>` — hide angle
        // brackets and slashes, show only the tag name.
        // After escaping: `&lt;strong&gt;`, `&lt;/strong&gt;`, `&lt;br/&gt;`
        const m = esc.match(/^(&lt;\/?)([\w]+)([\s/]*)(&gt;)$/i);
        if (m) {
          const [, prefix, name, mid, suffix] = m;
          return `<span class="tok-tag"><span class="tok-inv">${prefix}</span>${name}<span class="tok-inv">${mid}${suffix}</span></span>`;
        }
        return `<span class="tok-tag">${esc}</span>`;
      }

      case "keyword":
        return `<span class="tok-kw">${esc}</span>`;

      case "hash":
        return `<span class="tok-hash">${esc}</span>`;

      default:
        return esc;
    }
  }

  function renderHighlight(tokens: Token[]): string {
    // Trailing newline keeps the pre height in sync with the textarea when
    // the cursor sits on a phantom blank line at the end.
    return tokens.map(renderToken).join("") + "\n";
  }

  function handleInput(e: Event): void {
    const next = (e.currentTarget as HTMLTextAreaElement).value;
    value = next;
    onChange?.(next);
  }

  function syncScroll(): void {
    if (!preEl || !textareaEl) return;
    preEl.scrollTop = textareaEl.scrollTop;
    preEl.scrollLeft = textareaEl.scrollLeft;
  }
</script>

<div class="icu-wrap {className}" style="--rows: {rows}">
  <!-- highlight layer: sits behind the transparent textarea -->
  <pre bind:this={preEl} class="icu-hl" aria-hidden="true">{@html highlighted}</pre>
  <textarea
    bind:this={textareaEl}
    {id}
    {disabled}
    {placeholder}
    {rows}
    spellcheck="true"
    class="icu-ta"
    oninput={handleInput}
    onscroll={syncScroll}
    bind:value
  ></textarea>
</div>

<style>
  .icu-wrap {
    position: relative;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg);
    overflow: hidden;
  }

  .icu-wrap:focus-within {
    border-color: var(--color-border-brand);
  }

  /* Shared typography — must be pixel-identical so the overlay aligns. */
  .icu-hl,
  .icu-ta {
    margin: 0;
    padding: 6px 8px;
    font-family:
      ui-monospace,
      SFMono-Regular,
      "SF Mono",
      Menlo,
      monospace;
    font-size: 11px;
    line-height: 1.4;
    white-space: pre-wrap;
    word-wrap: break-word;
    overflow-wrap: break-word;
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    box-sizing: border-box;
    min-height: calc(var(--rows, 3) * 1.4em + 12px);
    tab-size: 2;
  }

  /* Highlight layer: behind the textarea, never receives pointer events. */
  .icu-hl {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
    color: var(--color-text);
  }

  /* Input layer: transparent text so the coloured pre shows through. */
  .icu-ta {
    position: relative;
    z-index: 1;
    color: transparent;
    caret-color: var(--color-text);
    resize: none;
    overflow: auto;
  }

  .icu-ta::placeholder {
    color: var(--color-text-secondary);
    opacity: 1;
  }

  .icu-ta:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /*
   * Token styles — scoped to .icu-wrap.
   *
   * RULE: no padding or border on overlay spans — they shift subsequent
   * characters and break the pre↔textarea pixel alignment.
   * Visual "border" is done with box-shadow (layout-neutral).
   */

  /* Variable placeholder `{name}` — blue pill, braces invisible */
  .icu-wrap :global(.tok-var) {
    color: #1d4ed8;
    background: color-mix(in srgb, #2563eb 16%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, #2563eb 50%, transparent);
    border-radius: 3px;
  }

  /* HTML inline tag `<strong>`, `</strong>` etc. — green pill, brackets invisible */
  .icu-wrap :global(.tok-tag) {
    color: #15803d;
    background: color-mix(in srgb, #16a34a 16%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, #16a34a 50%, transparent);
    border-radius: 3px;
  }

  /* Makes `{`, `}`, `<`, `>`, `/` invisible inside pills. */
  .icu-wrap :global(.tok-inv) {
    color: transparent;
  }

  /* `plural`, `one`, `other`, variant names — plain green, no pill */
  .icu-wrap :global(.tok-kw) {
    color: #16a34a;
  }

  /* `#` count marker inside plural bodies — small green pill */
  .icu-wrap :global(.tok-hash) {
    color: #15803d;
    background: color-mix(in srgb, #16a34a 16%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, #16a34a 50%, transparent);
    border-radius: 3px;
  }
</style>
