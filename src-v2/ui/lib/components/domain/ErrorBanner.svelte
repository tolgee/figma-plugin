<script lang="ts">
  type Props = { banner: { message: string; severity: "error" | "warning" } };
  let { banner }: Props = $props();
</script>

<div
  class={banner.severity === "error"
    ? "bg-red-100 text-red-900 p-2 text-sm"
    : "bg-yellow-100 text-yellow-900 p-2 text-sm"}
>
  {banner.message}
</div>
