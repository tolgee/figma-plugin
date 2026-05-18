<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send } from "$ui/lib/bus";
  import Button from "$ui/lib/components/ui/button.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";

  const languageOptions = $derived(
    auth.value.languages.map((l) => ({ value: l.tag, label: l.name })),
  );

  let language = $state<string>(appState.value.config?.language ?? "");

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
  <p class="text-xs text-text-secondary">
    Pick the language that the text on this page is currently written in. You
    can change it later.
  </p>
  <div class="flex flex-col gap-1">
    <Label for="page-setup-lang">Language</Label>
    <Select
      id="page-setup-lang"
      bind:value={language}
      options={languageOptions}
    />
  </div>
  <Button onclick={confirm} disabled={!language}>Confirm</Button>
</div>
