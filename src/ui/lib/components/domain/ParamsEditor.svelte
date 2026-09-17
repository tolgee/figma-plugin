<script lang="ts">
  import { ICON } from "$shared/iconSizes";
  import { Input, Label } from "$ui/lib/components/ui";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import Info from "lucide-svelte/icons/info";

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
    <Tooltip.Provider delayDuration={200}>
      <div class="flex items-center gap-1.5">
        <Label>Values for Figma</Label>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <span
                {...props}
                class="text-text-secondary transition-colors hover:text-text-brand"
                role="button"
                tabindex={-1}
                aria-label="What values for Figma are"
              >
                <Info size={ICON.inline} />
              </span>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content
            side="bottom"
            align="start"
            class="max-w-[15rem] leading-snug"
          >
            These values are only used to preview the translation in Figma. They
            won't be saved.
          </Tooltip.Content>
        </Tooltip.Root>
      </div>
    </Tooltip.Provider>
    {#each placeholders as p (p)}
      <div class="flex items-center gap-2">
        <span
          class="max-w-32 shrink-0 truncate font-mono text-xs"
          title={p}>{p}</span
        >
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
