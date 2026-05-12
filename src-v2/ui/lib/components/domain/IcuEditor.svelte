<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { EditorState } from "@codemirror/state";
  import {
    EditorView,
    type ViewUpdate,
    keymap,
    drawSelection,
    highlightSpecialChars,
  } from "@codemirror/view";
  import { history, defaultKeymap, historyKeymap } from "@codemirror/commands";
  import {
    tolgeeSyntax,
    TolgeeHighlight,
    PlaceholderPlugin,
  } from "@tginternal/editor";

  type Props = {
    value: string;
    onChange?: (next: string) => void;
    nested?: boolean;
    placeholders?: "initial" | "full" | "none";
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
    placeholders = "full",
    placeholder = "",
    rows = 3,
    class: className = "",
    id,
    disabled = false,
  }: Props = $props();

  let host = $state<HTMLDivElement | undefined>();
  // `view` is reactive so the sync-effect below re-runs once the editor has
  // actually been constructed — without this, the initial pass sees `view`
  // as null, returns, and the subsequent value-prop changes never fire the
  // effect again because no tracked dependency changed.
  let view = $state<EditorView | null>(null);
  let suppressNextEmit = false;

  function buildExtensions() {
    return [
      history(),
      drawSelection(),
      highlightSpecialChars(),
      keymap.of([...defaultKeymap, ...historyKeymap]),
      EditorView.lineWrapping,
      EditorView.contentAttributes.of({ spellcheck: "true" }),
      tolgeeSyntax(nested),
      PlaceholderPlugin({
        nested,
        tooltips: false,
        examplePluralNum: 1,
        allowedNewPlaceholders: placeholders === "none" ? [] : undefined,
      }),
      // TolgeeHighlight maps CodeMirror highlight tags via @lezer/highlight:
      //   - `function` colors keywords: plural / select / one / other / =0 / # /
      //     number / date / time / VariantDescriptor.
      //   - `other` colors variableName: the plural parameter `count`, format
      //     styles, FormatStyle values.
      //   - `main` colors plain text content.
      // CSS variables in inline `color:` work but resolve against the editor
      // root, which doesn't always inherit our Tailwind tokens cleanly. Using
      // concrete colors here so highlight is guaranteed visible in both themes.
      TolgeeHighlight({
        function: "#16a34a",
        other: "#2563eb",
        main: "currentColor",
      }),
      EditorView.updateListener.of((v: ViewUpdate) => {
        if (!v.docChanged) return;
        if (suppressNextEmit) {
          suppressNextEmit = false;
          return;
        }
        const next = v.state.doc.toString();
        value = next;
        onChange?.(next);
      }),
      EditorState.readOnly.of(disabled),
    ];
  }

  onMount(() => {
    if (!host) return;
    view = new EditorView({
      parent: host,
      state: EditorState.create({
        doc: value,
        extensions: buildExtensions(),
      }),
    });
  });

  onDestroy(() => {
    view?.destroy();
    view = null;
  });

  // Keep editor doc in sync if the prop changes externally (e.g. route load).
  $effect(() => {
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    suppressNextEmit = true;
    view.dispatch({
      changes: { from: 0, to: current.length, insert: value },
    });
  });
</script>

<div
  bind:this={host}
  {id}
  class="icu-editor {className}"
  style="--icu-rows: {rows}"
  data-placeholder={placeholder}
  data-empty={value === "" ? "true" : "false"}
></div>

<style>
  .icu-editor {
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--color-bg);
    font-size: 11px;
    line-height: 1.4;
    min-height: calc(var(--icu-rows, 3) * 1.4em + 12px);
    overflow: hidden;
    position: relative;
  }
  .icu-editor :global(.cm-editor) {
    height: 100%;
    outline: none;
  }
  .icu-editor :global(.cm-editor.cm-focused) {
    outline: none;
  }
  .icu-editor:focus-within {
    border-color: var(--color-border-brand);
  }
  .icu-editor :global(.cm-scroller) {
    padding: 6px 8px;
    font-family:
      ui-monospace,
      SFMono-Regular,
      "SF Mono",
      Menlo,
      monospace;
  }
  .icu-editor :global(.cm-content) {
    padding: 0;
  }
  .icu-editor :global(.cm-line) {
    padding: 0;
  }
  /* Placeholder render: only show when empty and editor is unfocused. */
  .icu-editor[data-empty="true"]:not(:focus-within)::before {
    content: attr(data-placeholder);
    position: absolute;
    top: 6px;
    left: 8px;
    color: var(--color-text-secondary);
    pointer-events: none;
    font-family:
      ui-monospace,
      SFMono-Regular,
      "SF Mono",
      Menlo,
      monospace;
  }
  /* Placeholder pill styling. Tolgee's PlaceholderPlugin emits widgets with
     classes `placeholder-widget` + `placeholder-${type}` (no cm- prefix). */
  .icu-editor :global(.placeholder-widget) {
    display: inline-block;
    padding: 0 4px;
    margin: 0 1px;
    border-radius: 3px;
    border: 1px solid var(--color-border);
    background: var(--color-bg-secondary);
    color: var(--color-text);
    font-size: 10px;
    line-height: 1.4;
    vertical-align: baseline;
  }
  .icu-editor :global(.placeholder-widget > span) {
    pointer-events: none;
  }
  .icu-editor :global(.placeholder-variable) {
    background: color-mix(in srgb, #2563eb 14%, transparent);
    border-color: #2563eb;
    color: #1d4ed8;
  }
  .icu-editor :global(.placeholder-tagOpen),
  .icu-editor :global(.placeholder-tagClose),
  .icu-editor :global(.placeholder-tagSelfClosed) {
    background: color-mix(in srgb, #16a34a 14%, transparent);
    border-color: #16a34a;
    color: #15803d;
  }
  .icu-editor :global(.placeholder-hash) {
    background: color-mix(in srgb, #16a34a 14%, transparent);
    border-color: #16a34a;
    color: #15803d;
  }
  .icu-editor :global(.placeholder-error) {
    background: color-mix(in srgb, var(--figma-color-bg-danger) 18%, transparent);
    border-color: var(--figma-color-border-danger, #ef4444);
    color: var(--figma-color-text-danger, #b91c1c);
  }
</style>
