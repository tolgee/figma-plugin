<script lang="ts">
  import { tokenize, type Token } from "$shared/tolgeeFormat";

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
          // Pill wraps ONLY the name; the (transparent) braces sit OUTSIDE it as
          // siblings, giving the pill a 1-char breathing gap from neighbouring
          // text without shifting any column (alignment stays exact).
          return `<span class="tok-inv">{</span><span class="tok-var">${inner}</span><span class="tok-inv">}</span>`;
        }
        return `<span class="tok-var">${esc}</span>`;
      }

      case "tag": {
        // HTML tags like `<strong>`, `</strong>`, `<br/>` — hide the angle
        // brackets, but KEEP the leading slash of a CLOSING tag visible so
        // `</b>` reads as a "/b" pill, distinct from the opening "b" pill (the
        // slash already occupies its column, so showing it preserves alignment).
        // After escaping: `&lt;strong&gt;`, `&lt;/strong&gt;`, `&lt;br/&gt;`
        const m = esc.match(/^(&lt;)(\/?)([\w]+)([\s/]*)(&gt;)$/i);
        if (m) {
          const [, lt, slash, name, mid, gt] = m;
          // Pill wraps only `/name`; the (transparent) angle brackets sit OUTSIDE
          // it as siblings → a 1-char breathing gap, alignment preserved.
          return `<span class="tok-inv">${lt}</span><span class="tok-tag">${slash}${name}</span><span class="tok-inv">${mid}${gt}</span>`;
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
    /* Lighter placeholder, matching the inputs' `placeholder:text-text-secondary/60`. */
    color: color-mix(in srgb, var(--color-text-secondary) 60%, transparent);
    opacity: 1;
  }

  .icu-ta:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /*
   * Token styles — scoped to .icu-wrap.
   *
   * RULE: never change an overlay span's net inline WIDTH — it would shift
   * following characters and break the pre↔textarea pixel alignment. The pills
   * get a little inner breathing room with `padding-inline` CANCELLED by an
   * equal negative `margin-inline`: the background grows but the layout width
   * stays zero-sum, so the caret keeps aligning. (No padding-BLOCK — that would
   * grow the line height and break vertical alignment.) The "border" is a
   * layout-neutral box-shadow.
   */

  /* Variable placeholder `{name}` — blue pill, braces invisible.
   * Colours come from the theme-aware semantic palette (styles.css): `-fg`
   * is the readable text shade (deep blue on light, bright blue on dark) and
   * the base `--sem-info` drives the tint + border, so the pill adapts to
   * Figma's light/dark theme instead of the old fixed hexes. */
  .icu-wrap :global(.tok-var) {
    color: var(--sem-info-fg);
    background: color-mix(in srgb, var(--sem-info) 16%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--sem-info) 50%, transparent);
    border-radius: 3px;
    padding-inline: 0.3em;
    margin-inline: -0.3em;
  }

  /* HTML inline tag `<strong>`, `</strong>` etc. — green pill, brackets invisible */
  .icu-wrap :global(.tok-tag) {
    color: var(--sem-success-fg);
    background: color-mix(in srgb, var(--sem-success) 16%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--sem-success) 50%, transparent);
    border-radius: 3px;
    padding-inline: 0.3em;
    margin-inline: -0.3em;
  }

  /* Makes `{`, `}`, `<`, `>`, `/` invisible inside pills. */
  .icu-wrap :global(.tok-inv) {
    color: transparent;
  }

  /* `plural`, `one`, `other`, variant names — plain green, no pill */
  .icu-wrap :global(.tok-kw) {
    color: var(--sem-success-fg);
  }

  /* `#` count marker inside plural bodies — small green pill */
  .icu-wrap :global(.tok-hash) {
    color: var(--sem-success-fg);
    background: color-mix(in srgb, var(--sem-success) 16%, transparent);
    box-shadow: 0 0 0 1px color-mix(in srgb, var(--sem-success) 50%, transparent);
    border-radius: 3px;
    padding-inline: 0.3em;
    margin-inline: -0.3em;
  }
</style>
