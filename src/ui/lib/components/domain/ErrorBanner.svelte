<script lang="ts">
  type Props = { banner: { message: string; severity: "error" | "warning" } };
  let { banner }: Props = $props();

  // Same theme-aware `--sem-*` + `color-mix()` technique as `Message.svelte`,
  // with the SAME tint percentages (8% background / 45% border) so the two
  // read as the same severity colour, not just the same hue — but deliberately
  // WITHOUT an icon, and with only a bottom border rather than a full rounded
  // border: that's the whole point of `ErrorBanner`, a plain, icon-less,
  // full-bleed banner, unlike `Message`.
  const style = $derived(
    `color: var(--sem-${banner.severity}-fg); background-color: color-mix(in srgb, var(--sem-${banner.severity}) 8%, transparent); border-bottom-color: color-mix(in srgb, var(--sem-${banner.severity}) 45%, transparent);`,
  );
</script>

<div class="border-b p-2 text-sm" {style}>
  {banner.message}
</div>
