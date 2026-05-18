<script lang="ts">
  import { Input, Label } from "$ui/lib/components/ui";

  type Props = {
    translation: string;
    values: Record<string, string>;
    onChange: (values: Record<string, string>) => void;
  };
  let { translation, values, onChange }: Props = $props();

  /**
   * Extracts ICU placeholder names from a translation string.
   *
   * Matches `{name}` and `{name, ...}` shapes. Filters out:
   * - Pure-numeric placeholders (these are positional ICU args, not named
   *   parameters editable by users).
   * - The `#` plural marker is not matched by `\w+` anyway, but we belt-and-
   *   suspender it here to make intent explicit.
   */
  function extractPlaceholders(text: string): string[] {
    const re = /\{(\w+)(?:,[^}]*)?\}/g;
    const out = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(text)) !== null) {
      const name = m[1];
      if (!name) continue;
      if (name === "#") continue;
      if (/^\d+$/.test(name)) continue;
      out.add(name);
    }
    return Array.from(out);
  }

  const placeholders = $derived(extractPlaceholders(translation));

  function set(name: string, v: string): void {
    onChange({ ...values, [name]: v });
  }
</script>

{#if placeholders.length > 0}
  <div class="space-y-2">
    <Label>Parameters</Label>
    {#each placeholders as p (p)}
      <div class="flex items-center gap-2">
        <span class="text-xs font-mono w-20 truncate" title={p}>{p}</span>
        <Input
          value={values[p] ?? ""}
          oninput={(e) =>
            set(p, (e.currentTarget as HTMLInputElement).value)}
          placeholder="example"
          class="flex-1"
        />
      </div>
    {/each}
  </div>
{/if}
