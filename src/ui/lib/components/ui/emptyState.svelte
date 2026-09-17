<script lang="ts">
  // Shared empty-state pattern: a muted icon centred (both axes) on the
  // available area, with a title and optional description below. Used wherever
  // a view has nothing to show (no selection, no matches, nothing to translate,
  // …) so every empty state looks and aligns the same.
  //
  // `icon` is any component with the shared icon API (`size` + `class`) — a
  // lucide icon or the Tolgee brand mark. The muted, FULLY OPAQUE
  // `text-icon-muted` colour avoids the overlap seams translucent colours
  // create on glyphs with crossing strokes.
  import type { Component, ComponentType, SvelteComponent } from "svelte";
  import { ICON } from "$shared/iconSizes";

  // Accepts both Svelte 5 components (the Tolgee brand mark) and the legacy
  // class components lucide-svelte still ships — both render with size + class.
  type IconComponent =
    | Component<{ size?: number; class?: string }>
    | ComponentType<SvelteComponent<{ size?: number | string; class?: string }>>;

  type Props = {
    icon?: IconComponent;
    title: string;
    description?: string;
  };

  let { icon: Icon, title, description }: Props = $props();
</script>

<div
  class="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center"
>
  {#if Icon}
    <Icon size={ICON.hero} class="text-icon-muted" />
  {/if}
  <div class="space-y-0.5 text-text-secondary">
    <p class="text-sm">{title}</p>
    {#if description}
      <p class="text-xs">{description}</p>
    {/if}
  </div>
</div>
