<script lang="ts">
  import { ICON } from "$shared/iconSizes";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send } from "$ui/lib/bus";
  import IconButton from "$ui/lib/components/ui/iconButton.svelte";
  import Select from "$ui/lib/components/ui/select.svelte";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import SettingsIcon from "lucide-svelte/icons/settings";
  import CopyIcon from "lucide-svelte/icons/files";

  type LanguageOption = { value: string; label: string };
  type BranchOption = { value: string; label: string };

  type Props = {
    /** Optional languages list (from API). When unset, header shows current value only. */
    languages?: LanguageOption[];
    /** Optional branches list (only used when branching is enabled). */
    branches?: BranchOption[];
    /** Whether branching is enabled for this project/document. */
    branchingEnabled?: boolean;
  };

  let {
    languages = [],
    branches = [],
    branchingEnabled = false,
  }: Props = $props();

  const language = $derived(appState.value.config?.language ?? "");
  const branch = $derived(appState.value.config?.branch ?? "");

  function handleLanguageChange(v: string): void {
    if (!v || v === language) return;
    // Picking a language is treated as a preview: navigate to the Pull view
    // with the new tag in the route. The actual persistence happens only when
    // the user clicks Apply in Pull — cancelling there leaves the saved
    // language untouched.
    appState.navigate({ name: "pull", lang: v });
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

  // Dev Mode hides design-changing entry points (cosmetic layer — the
  // navigation gate in appState.navigate and the bus guard are the real
  // defence): language select navigates to Pull, the copy button to
  // CreateCopy. Matches production (Index.tsx hides its language select and
  // Copy there). Branch select STAYS — set-branch is metadata-classed, and
  // a developer reading strings off a branch is a legitimate dev-mode need.
  const isDev = $derived(appState.value.editorType === "dev");

  const branchOptions = $derived<BranchOption[]>(
    branch && !branches.some((o) => o.value === branch)
      ? [{ value: branch, label: branch }, ...branches]
      : branches,
  );
</script>

<header class="flex items-center gap-2 px-3 py-2">
  <h1 class="shrink-0 text-sm font-semibold text-text">Strings</h1>

  {#if auth.value.authenticated}
    <div class="flex flex-1 items-center gap-2">
      {#if isDev}
        <!-- Language select opens Pull (design-only); nothing to pick here. -->
      {:else if languageOptions.length > 0}
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
    <span class="flex-1 text-xs text-text-secondary">Not connected</span>
  {/if}

  <Tooltip.Provider delayDuration={200}>
    {#if auth.value.authenticated && !isDev}
      <Tooltip.Root>
        <Tooltip.Trigger>
          {#snippet child({ props })}
            <IconButton
              {...props}
              onclick={openCreateCopy}
              aria-label="Create page copy"
            >
              <CopyIcon size={ICON.action} />
            </IconButton>
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
          <IconButton
            {...props}
            onclick={openSettings}
            aria-label="Open settings"
          >
            <SettingsIcon size={ICON.action} />
          </IconButton>
        {/snippet}
      </Tooltip.Trigger>
      <Tooltip.Content side="bottom" align="end">
        Open plugin settings
      </Tooltip.Content>
    </Tooltip.Root>
  </Tooltip.Provider>
</header>
