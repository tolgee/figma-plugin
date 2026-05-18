<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send } from "$ui/lib/bus";
  import Button from "$ui/lib/components/ui/button.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import SettingsIcon from "lucide-svelte/icons/settings";
  import CopyIcon from "lucide-svelte/icons/copy-plus";

  type LanguageOption = { value: string; label: string };
  type NamespaceOption = { value: string; label: string };
  type BranchOption = { value: string; label: string };

  type Props = {
    /** Optional languages list (from API). When unset, header shows current value only. */
    languages?: LanguageOption[];
    /** Optional namespaces list (from API + local nodes). */
    namespaces?: NamespaceOption[];
    /** Optional branches list (only used when branching is enabled). */
    branches?: BranchOption[];
    /** Whether namespaces are enabled for this project. */
    namespacesEnabled?: boolean;
    /** Whether branching is enabled for this project/document. */
    branchingEnabled?: boolean;
  };

  let {
    languages = [],
    namespaces = [],
    branches = [],
    namespacesEnabled = false,
    branchingEnabled = false,
  }: Props = $props();

  const language = $derived(appState.value.config?.language ?? "");
  const namespace = $derived(appState.value.config?.namespace ?? "");
  const branch = $derived(appState.value.config?.branch ?? "");

  function handleLanguageChange(v: string): void {
    if (!v || v === language) return;
    // Picking a language is treated as a preview: navigate to the Pull view
    // with the new tag in the route. The actual persistence happens only when
    // the user clicks Apply in Pull — cancelling there leaves the saved
    // language untouched.
    appState.navigate({ name: "pull", lang: v });
  }

  function handleNamespaceChange(v: string): void {
    send({ type: "save-config", config: { namespace: v } });
  }

  function handleBranchChange(v: string): void {
    if (!v || v === branch) return;
    send({ type: "set-branch", branch: v });
  }

  function openSettings(): void {
    appState.navigate({ name: "settings" });
  }

  function openCreateCopy(): void {
    appState.navigate({ name: "createCopy" });
  }

  // Build augmented option lists so the currently selected value is always
  // present even if the languages/namespaces lists haven't loaded yet.
  const languageOptions = $derived<LanguageOption[]>(
    language && !languages.some((o) => o.value === language)
      ? [{ value: language, label: language }, ...languages]
      : languages,
  );

  const namespaceOptions = $derived<NamespaceOption[]>(
    namespace && !namespaces.some((o) => o.value === namespace)
      ? [{ value: namespace, label: namespace }, ...namespaces]
      : namespaces,
  );

  const branchOptions = $derived<BranchOption[]>(
    branch && !branches.some((o) => o.value === branch)
      ? [{ value: branch, label: branch }, ...branches]
      : branches,
  );
</script>

<header
  class="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-bg px-3 py-2"
>
  <span class="text-sm font-bold tracking-tight text-text-brand"> Tolgee </span>

  {#if auth.value.authenticated}
    <div class="flex flex-1 items-center gap-2">
      {#if languageOptions.length > 0}
        <Select
          value={language}
          options={languageOptions}
          placeholder="Language"
          onChange={handleLanguageChange}
          class="min-w-[80px]"
        />
      {:else}
        <span class="text-xs text-text-secondary italic">
          Connect to Tolgee for languages…
        </span>
      {/if}

      {#if namespacesEnabled && namespaceOptions.length > 0}
        <Select
          value={namespace}
          options={namespaceOptions}
          placeholder="Namespace"
          onChange={handleNamespaceChange}
          class="min-w-[80px]"
        />
      {/if}

      {#if branchingEnabled && branchOptions.length > 0}
        <Select
          value={branch}
          options={branchOptions}
          placeholder="Branch"
          onChange={handleBranchChange}
          class="min-w-[80px]"
        />
      {/if}
    </div>
  {:else}
    <span class="flex-1 text-xs text-text-secondary"> Not connected </span>
  {/if}

  <Tooltip.Provider delayDuration={200}>
    {#if auth.value.authenticated}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <Button
              {...props}
              variant="ghost"
              size="sm"
              onclick={openCreateCopy}
              aria-label="Create page copy"
            >
              <CopyIcon size={14} />
            </Button>
          {/snippet}
        </Tooltip.Trigger>
        <Tooltip.Content side="bottom" align="end">
          Create a duplicate of this page<br />(per language or with raw keys)
        </Tooltip.Content>
      </Tooltip.Root>
    {/if}
    <Tooltip.Root>
      <Tooltip.Trigger>
        {#snippet child({ props })}
          <Button
            {...props}
            variant="ghost"
            size="sm"
            onclick={openSettings}
            aria-label="Open settings"
          >
            <SettingsIcon size={14} />
          </Button>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom" align="end">
        Open plugin settings
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
</header>
