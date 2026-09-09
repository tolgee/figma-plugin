<script lang="ts">
  // Tag multi-select with autocomplete: selected tags show as removable chips,
  // an inline input filters existing project tags (fetched via `fetchSuggestions`)
  // and offers to CREATE a new tag when what's typed isn't there yet. New tags
  // are just strings in `value` — Tolgee creates them on push when the keys are
  // tagged. The dropdown is caret-/field-anchored (fixed → not clipped by the
  // scrolling settings panel) and flips above when there's no room below.
  import { cn } from "$ui/lib/utils";
  import X from "lucide-svelte/icons/x";

  type Props = {
    value: string[];
    onChange: (tags: string[]) => void;
    /** Returns existing project tag names matching `query` (for the dropdown). */
    fetchSuggestions?: (query: string) => Promise<string[]>;
    placeholder?: string;
    id?: string;
    class?: string;
  };
  let {
    value,
    onChange,
    fetchSuggestions,
    placeholder = "Add tag…",
    id,
    class: className,
  }: Props = $props();

  let wrapper = $state<HTMLDivElement>();
  let inputEl = $state<HTMLInputElement>();
  let inputValue = $state("");
  let open = $state(false);
  let suggestions = $state<string[]>([]);
  let activeIndex = $state(0);
  let menu = $state<{
    left: number;
    top: number | null;
    bottom: number | null;
    width: number;
  }>({ left: 0, top: 0, bottom: null, width: 0 });
  let debounce: ReturnType<typeof setTimeout> | null = null;

  const trimmed = $derived(inputValue.trim());
  // Existing tags not already picked, filtered by what's typed.
  const available = $derived(
    suggestions.filter(
      (s) =>
        !value.includes(s) &&
        (!trimmed || s.toLowerCase().includes(trimmed.toLowerCase())),
    ),
  );
  // Offer "create" when the typed value isn't already an option or selected.
  const canCreate = $derived(
    Boolean(trimmed) &&
      !value.includes(trimmed) &&
      !available.some((s) => s.toLowerCase() === trimmed.toLowerCase()),
  );
  // Flat option list for keyboard nav (existing first, then the create row).
  const options = $derived([
    ...available.map((name) => ({ kind: "existing" as const, name })),
    ...(canCreate ? [{ kind: "create" as const, name: trimmed }] : []),
  ]);

  function position(): void {
    if (!wrapper) return;
    const r = wrapper.getBoundingClientRect();
    const spaceBelow = window.innerHeight - r.bottom;
    if (spaceBelow < 220) {
      menu = {
        left: r.left,
        top: null,
        bottom: window.innerHeight - r.top + 4,
        width: r.width,
      };
    } else {
      menu = { left: r.left, top: r.bottom + 4, bottom: null, width: r.width };
    }
  }

  async function loadSuggestions(): Promise<void> {
    if (!fetchSuggestions) return;
    const q = inputValue;
    const res = await fetchSuggestions(q);
    if (q === inputValue) suggestions = res; // ignore stale responses
  }

  function openMenu(): void {
    open = true;
    activeIndex = 0;
    position();
    if (debounce) clearTimeout(debounce);
    debounce = setTimeout(loadSuggestions, 150);
  }

  function addTag(tag: string): void {
    const t = tag.trim();
    inputValue = "";
    activeIndex = 0;
    inputEl?.focus();
    if (!t || value.includes(t)) return;
    onChange([...value, t]);
    openMenu();
  }

  function removeTag(tag: string): void {
    onChange(value.filter((v) => v !== tag));
    inputEl?.focus();
  }

  function onKeydown(e: KeyboardEvent): void {
    const n = options.length;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      open = true;
      if (n) activeIndex = (activeIndex + 1) % n;
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (n) activeIndex = (activeIndex - 1 + n) % n;
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const opt = options[activeIndex];
      if (opt) addTag(opt.name);
      else if (trimmed) addTag(trimmed);
      return;
    }
    if (e.key === "Escape") {
      open = false;
      return;
    }
    if (e.key === "Backspace" && !inputValue && value.length > 0) {
      e.preventDefault();
      const last = value[value.length - 1];
      if (last) removeTag(last);
    }
  }
</script>

<div bind:this={wrapper} class={cn("relative", className)}>
  <div
    class="flex flex-wrap items-center gap-1 rounded border border-border bg-bg px-1.5 py-1 transition-colors focus-within:border-border-brand hover:border-text/30"
  >
    {#each value as tag (tag)}
      <span
        class="flex items-center gap-1 rounded bg-bg-secondary px-1.5 py-0.5 text-xs text-text"
      >
        {tag}
        <button
          type="button"
          class="text-text-secondary transition-colors hover:text-text-brand"
          aria-label={`Remove ${tag}`}
          onclick={() => removeTag(tag)}
        >
          <X size={12} />
        </button>
      </span>
    {/each}
    <input
      bind:this={inputEl}
      {id}
      bind:value={inputValue}
      placeholder={value.length ? "" : placeholder}
      class="min-w-[6rem] flex-1 bg-transparent px-1 text-xs text-text outline-none placeholder:text-text-secondary/60"
      oninput={openMenu}
      onfocus={openMenu}
      onkeydown={onKeydown}
      onblur={() => setTimeout(() => (open = false), 120)}
    />
  </div>

  {#if open && options.length > 0}
    <ul
      class="fixed z-50 max-h-56 overflow-auto rounded-md border border-border bg-bg py-1 shadow-lg"
      style="left: {menu.left}px; {menu.top != null
        ? `top: ${menu.top}px`
        : `bottom: ${menu.bottom}px`}; width: {menu.width}px;"
    >
      {#if available.length > 0}
        <li
          class="px-2.5 pb-0.5 pt-1 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
        >
          Tags existing in project
        </li>
      {/if}
      {#each options as opt, i (opt.kind + opt.name)}
        <li>
          <button
            type="button"
            class={cn(
              "flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-xs",
              i === activeIndex ? "bg-bg-secondary" : "hover:bg-bg-secondary",
            )}
            onmouseenter={() => (activeIndex = i)}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => addTag(opt.name)}
          >
            {#if opt.kind === "create"}
              <span class="font-medium text-primary">Create</span>
              <span class="rounded bg-bg-secondary px-1.5 py-0.5 text-text">
                {opt.name}
              </span>
            {:else}
              <span class="text-text">{opt.name}</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
