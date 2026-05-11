<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { send } from "$ui/lib/bus";
  import Button from "$ui/lib/components/ui/button.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";

  // Fallback languages until the API list is available.
  const fallbackLangs: Array<{ value: string; label: string }> = [
    { value: "en", label: "English" },
    { value: "de", label: "German" },
    { value: "cs", label: "Czech" },
  ];

  let language = $state<string>(appState.value.config?.language ?? "en");

  function confirm(): void {
    send({
      type: "save-config",
      config: { language, pageInfo: true },
    });
    appState.navigate({ name: "index" });
  }
</script>

<div class="space-y-3 p-4">
  <h1 class="text-base font-semibold">Set up this page</h1>
  <p class="text-xs text-[var(--color-text-secondary)]">
    Pick the language that the text on this page is currently written in. You
    can change it later.
  </p>
  <div class="flex flex-col gap-1">
    <Label for="page-setup-lang">Language</Label>
    <Select
      id="page-setup-lang"
      bind:value={language}
      options={fallbackLangs}
    />
  </div>
  <Button onclick={confirm} disabled={!language}>Confirm</Button>
</div>
