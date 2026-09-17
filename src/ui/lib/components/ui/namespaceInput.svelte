<script lang="ts">
  // Single-value namespace combobox: pick an existing namespace or type a NEW
  // one (created on push). Mirrors the multi-value `TagInput` look/behaviour and
  // the original plugin's `AutocompleteSelect` (singleSelect). "" = the
  // "<none>" (default) namespace. The dropdown is caret-/field-anchored (fixed →
  // not clipped by the scrolling settings panel) and flips above when there's no
  // room below.
  import { cn } from "$ui/lib/utils";

  const NONE = "<none>";

  type Props = {
    value: string; // "" = <none>
    onChange: (value: string) => void;
    /** Existing project namespaces (for the suggestions). */
    options?: string[];
    placeholder?: string;
    id?: string;
    class?: string;
  };
  let {
    value,
    onChange,
    options = [],
    placeholder = "Add namespace…",
    id,
    class: className,
  }: Props = $props();

  let wrapper = $state<HTMLDivElement>();
  let inputEl = $state<HTMLInputElement>();
  let inputValue = $state("");
  let focused = $state(false);
  let open = $state(false);
  let activeIndex = $state(0);
  let menu = $state<{
    left: number;
    top: number | null;
    bottom: number | null;
    width: number;
  }>({ left: 0, top: 0, bottom: null, width: 0 });

  // Show the raw typed text while focused; the selected value (or <none>) when
  // not. Keeps the field readable without forcing the user to retype.
  const shown = $derived(focused ? inputValue : value || NONE);

  const trimmed = $derived(inputValue.trim());
  // Existing namespaces + an explicit "" (<none>), filtered by what's typed.
  const available = $derived(
    ["", ...options].filter((o) => {
      const label = o || NONE;
      return !trimmed || label.toLowerCase().includes(trimmed.toLowerCase());
    }),
  );
  // Offer "Add" when the typed value is new (not an existing namespace / current).
  const canCreate = $derived(
    Boolean(trimmed) &&
      trimmed !== value &&
      !options.some((o) => o.toLowerCase() === trimmed.toLowerCase()),
  );
  const items = $derived([
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

  function openMenu(): void {
    open = true;
    activeIndex = 0;
    position();
  }

  function choose(v: string): void {
    onChange(v);
    inputValue = "";
    open = false;
    focused = false;
    inputEl?.blur();
  }

  function onFocus(): void {
    focused = true;
    inputValue = "";
    openMenu();
  }

  function onKeydown(e: KeyboardEvent): void {
    const n = items.length;
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
      const opt = items[activeIndex];
      if (opt) choose(opt.name);
      else if (trimmed) choose(trimmed);
      return;
    }
    if (e.key === "Escape") {
      open = false;
      inputEl?.blur();
    }
  }
</script>

<div bind:this={wrapper} class={cn("relative", className)}>
  <input
    bind:this={inputEl}
    {id}
    value={shown}
    {placeholder}
    class="h-7 w-full rounded border border-border bg-bg px-2 text-xs text-text transition-colors hover:border-text/30 focus:border-border-brand focus:outline-none placeholder:text-text-secondary/60"
    oninput={(e) => {
      inputValue = e.currentTarget.value;
      openMenu();
    }}
    onfocus={onFocus}
    onkeydown={onKeydown}
    onblur={() => setTimeout(() => ((open = false), (focused = false)), 120)}
  />

  {#if open && items.length > 0}
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
          Existing namespaces
        </li>
      {/if}
      {#each items as opt, i (opt.kind + opt.name)}
        <li>
          <button
            type="button"
            class={cn(
              "flex w-full items-center gap-1.5 px-2.5 py-1 text-left text-xs",
              i === activeIndex ? "bg-bg-secondary" : "hover:bg-bg-secondary",
            )}
            onmouseenter={() => (activeIndex = i)}
            onmousedown={(e) => e.preventDefault()}
            onclick={() => choose(opt.name)}
          >
            {#if opt.kind === "create"}
              <span class="font-medium text-primary">Create</span>
              <span class="rounded bg-bg-secondary px-1.5 py-0.5 text-text">
                {opt.name}
              </span>
            {:else}
              <span class="text-text">{opt.name || NONE}</span>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>
