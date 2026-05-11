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
  let view: EditorView | null = null;
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
      TolgeeHighlight({
        function: "var(--icu-fn, #16a34a)",
        other: "var(--icu-other, #2563eb)",
        main: "var(--color-text)",
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
  /* Placeholder pill styling — Tolgee's PlaceholderPlugin emits widgets with
     class names that we style here so we don't need @emotion/styled. */
  .icu-editor :global(.cm-placeholder-widget) {
    display: inline-block;
    padding: 0 4px;
    margin: 0 1px;
    border-radius: 3px;
    background: var(--color-bg-secondary);
    border: 1px solid var(--color-border);
    color: var(--color-text);
    font-size: 10px;
  }
  .icu-editor :global(.cm-placeholder-variable) {
    background: color-mix(in srgb, var(--color-bg-brand) 14%, transparent);
    border-color: var(--color-border-brand);
    color: var(--color-text-brand);
  }
  .icu-editor :global(.cm-placeholder-tag) {
    background: color-mix(in srgb, #16a34a 14%, transparent);
    border-color: #16a34a;
    color: #16a34a;
  }
  .icu-editor :global(.cm-placeholder-variant) {
    background: color-mix(in srgb, #f59e0b 14%, transparent);
    border-color: #f59e0b;
    color: #92400e;
  }
</style>
