<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { ICON } from "$shared/iconSizes";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send } from "$ui/lib/bus";
  import {
    validateApiKey,
    hasRequiredScopes,
    REQUIRED_SCOPES,
  } from "$ui/lib/api/auth";
  import { createTolgeeClient } from "$ui/lib/api/client";
  import { getProjectMeta } from "$ui/lib/api/projectMeta";
  import { hydratePickers, hydrateBranches } from "$ui/lib/api/pickers";
  import Button from "$ui/lib/components/ui/button.svelte";
  import IconButton from "$ui/lib/components/ui/iconButton.svelte";
  import Input from "$ui/lib/components/ui/input.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";
  import Message from "$ui/lib/components/ui/message.svelte";
  import TruncatedText from "$ui/lib/components/ui/truncatedText.svelte";
  import Eye from "lucide-svelte/icons/eye";
  import EyeOff from "lucide-svelte/icons/eye-off";

  type Props = {
    form: Partial<TolgeeConfig>;
    /** Settings persists the cleared key on disconnect so it sticks without a
     *  Save. The onboarding wizard persists nothing until its final Save — and
     *  a `save-config` here would stamp `documentInfo`, closing the onboarding
     *  gate and dumping the user onto the Index "Sign in" screen — so there
     *  disconnect only resets the in-memory auth and stays on step 1. */
    persistDisconnect?: boolean;
  };
  let { form = $bindable(), persistDisconnect = true }: Props = $props();

  let showKey = $state(false);
  let connecting = $state(false);
  let errorMsg = $state<string | null>(null);

  const apiUrl = $derived(form.apiUrl ?? "");

  const showHttpWarning = $derived(
    apiUrl.startsWith("http://") &&
      !apiUrl.startsWith("http://localhost") &&
      !apiUrl.startsWith("http://127."),
  );

  const missingPullScope = $derived(
    auth.value.authenticated &&
      !hasRequiredScopes(auth.value.scopes, [...REQUIRED_SCOPES.pull]),
  );

  // Link straight to the connected project's dashboard in Tolgee.
  const projectLink = $derived(
    auth.value.projectId != null
      ? `${auth.value.apiUrl.replace(/\/$/, "")}/projects/${auth.value.projectId}`
      : null,
  );

  function handleUrlBlur(): void {
    const trimmed = (form.apiUrl ?? "").replace(/\/$/, "");
    form.apiUrl = trimmed;
  }

  async function connect(): Promise<void> {
    if (!form.apiUrl || !form.apiKey) {
      errorMsg = "Please enter the Tolgee URL and project API key.";
      return;
    }
    connecting = true;
    errorMsg = null;
    try {
      const result = await validateApiKey(form.apiUrl, form.apiKey);
      if (!result.ok) {
        errorMsg = errorToHuman(result.error);
        return;
      }
      const client = createTolgeeClient(form.apiUrl, form.apiKey);
      auth.setAuth({
        client,
        apiUrl: form.apiUrl,
        apiKey: form.apiKey,
        projectId: result.projectId,
        scopes: result.scopes,
      });
      send({ type: "persist-project-id", projectId: result.projectId });
      // Populate the language + namespace pickers now — a manual connect
      // (onboarding, or Settings on a fresh document) otherwise leaves the
      // "Current language" / namespace selects empty, since the startup
      // bootstrap is the only other place that hydrates them. Best-effort.
      void hydratePickers(client);
      // Fetch the project name (and feature flags) so we can show a friendly
      // "<project> was successfully connected" with a link to it.
      try {
        const meta = await getProjectMeta(
          form.apiUrl,
          form.apiKey,
          result.projectId,
        );
        auth.setProjectFeatures({
          branchingEnabled: meta.branchingEnabled,
          namespacesEnabled: meta.namespacesFeaturesEnabled,
          projectName: meta.name,
        });
        // Load branches only when the project uses branching, so the setup can
        // pre-fill the default branch (main) instead of leaving it empty.
        if (meta.branchingEnabled) void hydrateBranches(client);
      } catch {
        auth.setProjectFeatures({
          branchingEnabled: false,
          namespacesEnabled: false,
          projectName: `Project #${result.projectId}`,
        });
      }
    } catch (e) {
      errorMsg = e instanceof Error ? e.message : String(e);
    } finally {
      connecting = false;
    }
  }

  function disconnect(): void {
    auth.clear();
    form.apiKey = "";
    errorMsg = null;
    if (persistDisconnect) send({ type: "save-config", config: { apiKey: "" } });
  }

  function openProject(): void {
    if (projectLink) send({ type: "open-external", url: projectLink });
  }

  function errorToHuman(key: string): string {
    switch (key) {
      case "auth.invalid_api_key":
        return "Invalid API key.";
      case "auth.request_failed":
        return "Request failed. Please check the Tolgee URL.";
      case "auth.missing_project_id":
        return "API key is not bound to a project.";
      case "auth.network_error":
        return "Network error. Could not reach the server.";
      default:
        return key;
    }
  }
</script>

<section class="space-y-2.5">
  <h2 class="text-xs font-semibold uppercase tracking-wide text-primary">
    Connection
  </h2>
  <div class="space-y-1">
    <Label for="settings-api-url">Tolgee URL</Label>
    <Input
      id="settings-api-url"
      type="url"
      placeholder="https://app.tolgee.io"
      bind:value={form.apiUrl}
      onblur={handleUrlBlur}
      class="w-full"
    />
    {#if showHttpWarning}
      <p class="text-[10px] text-text-secondary">
        Using insecure http:// — consider https:// in production.
      </p>
    {/if}
  </div>

  <div class="space-y-1">
    <Label for="settings-api-key">Tolgee Project API key</Label>
    <div class="flex items-center gap-1">
      <Input
        id="settings-api-key"
        type={showKey ? "text" : "password"}
        placeholder="tgpak_..."
        bind:value={form.apiKey}
        class="flex-1"
      />
      <IconButton
        size="md"
        onclick={() => (showKey = !showKey)}
        aria-label={showKey ? "Hide API key" : "Show API key"}
      >
        {#if showKey}
          <EyeOff size={ICON.action} />
        {:else}
          <Eye size={ICON.action} />
        {/if}
      </IconButton>
    </div>
  </div>

  {#if auth.value.authenticated}
    <!-- Connected: a secondary/teal state message (connected = teal, our state
         colour), project name links straight to Tolgee. -->
    <Message variant="secondary">
      <div class="flex items-center justify-between gap-2">
        <span class="flex min-w-0 items-center gap-1">
          <!-- Project name truncates (full name in a tooltip via TruncatedText);
               the suffix stays. Always-underlined secondary-dark link → reads as
               the actionable "open project" link, distinct from the app's other
               links (which only underline on hover). -->
          <TruncatedText
            text={auth.value.projectName ?? "Project"}
            onclick={openProject}
            class="font-semibold text-secondary-dark underline underline-offset-2 transition-opacity hover:opacity-80"
          />
          <span class="shrink-0">was successfully connected</span>
        </span>
        <Button
          variant="outline"
          size="sm"
          class="bg-bg"
          onclick={disconnect}
        >
          Disconnect
        </Button>
      </div>
    </Message>
  {:else}
    <Button
      onclick={connect}
      disabled={connecting || !form.apiUrl || !form.apiKey}
    >
      {connecting ? "Connecting…" : "Connect"}
    </Button>
  {/if}

  {#if errorMsg}
    <Message variant="error">{errorMsg}</Message>
  {/if}

  {#if missingPullScope}
    <Message variant="error">
      API key is missing required scope:
      <code>{REQUIRED_SCOPES.pull.join(", ")}</code>
    </Message>
  {/if}
</section>
