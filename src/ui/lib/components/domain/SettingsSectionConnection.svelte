<script lang="ts">
  import type { TolgeeConfig } from "$shared/types";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send } from "$ui/lib/bus";
  import {
    validateApiKey,
    hasRequiredScopes,
    REQUIRED_SCOPES,
  } from "$ui/lib/api/auth";
  import { createTolgeeClient } from "$ui/lib/api/client";
  import Button from "$ui/lib/components/ui/button.svelte";
  import Input from "$ui/lib/components/ui/input.svelte";
  import Label from "$ui/lib/components/ui/label.svelte";
  import Eye from "lucide-svelte/icons/eye";
  import EyeOff from "lucide-svelte/icons/eye-off";
  import CheckCircle2 from "lucide-svelte/icons/check-circle-2";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";

  type Props = { form: Partial<TolgeeConfig> };
  let { form = $bindable() }: Props = $props();

  let showKey = $state(false);
  let testing = $state(false);
  let testResult = $state<null | {
    ok: boolean;
    message: string;
    projectId?: number;
    scopes?: string[];
  }>(null);

  const apiUrl = $derived(form.apiUrl ?? "");

  const showHttpWarning = $derived(
    apiUrl.startsWith("http://") &&
      !apiUrl.startsWith("http://localhost") &&
      !apiUrl.startsWith("http://127."),
  );

  const missingPullScope = $derived(
    testResult?.ok &&
      testResult.scopes &&
      !hasRequiredScopes(testResult.scopes, [...REQUIRED_SCOPES.pull]),
  );

  function handleUrlBlur(): void {
    const trimmed = (form.apiUrl ?? "").replace(/\/$/, "");
    form.apiUrl = trimmed;
  }

  async function testConnection(): Promise<void> {
    if (!form.apiUrl || !form.apiKey) {
      testResult = {
        ok: false,
        message: "Please enter API URL and API key.",
      };
      return;
    }
    testing = true;
    testResult = null;
    try {
      const result = await validateApiKey(form.apiUrl, form.apiKey);
      if (result.ok) {
        testResult = {
          ok: true,
          message: `Connected to project #${result.projectId}${
            result.userFullName ? ` (${result.userFullName})` : ""
          }`,
          projectId: result.projectId,
          scopes: result.scopes,
        };
        // Update global auth store so the rest of the app reacts immediately.
        auth.setAuth({
          client: createTolgeeClient(form.apiUrl, form.apiKey),
          apiUrl: form.apiUrl,
          apiKey: form.apiKey,
          projectId: result.projectId,
          scopes: result.scopes,
        });
        // Persist projectId on the document so the dev-mode inspect panel can
        // build project-aware Tolgee deep-links without re-validating the key.
        send({ type: "persist-project-id", projectId: result.projectId });
      } else {
        testResult = {
          ok: false,
          message: errorToHuman(result.error),
        };
      }
    } catch (e) {
      testResult = {
        ok: false,
        message: e instanceof Error ? e.message : String(e),
      };
    } finally {
      testing = false;
    }
  }

  function disconnect(): void {
    auth.clear();
    form.apiKey = "";
    testResult = null;
    send({ type: "save-config", config: { apiKey: "" } });
  }

  function errorToHuman(key: string): string {
    switch (key) {
      case "auth.invalid_api_key":
        return "Invalid API key.";
      case "auth.request_failed":
        return "Request failed. Please check the API URL.";
      case "auth.missing_project_id":
        return "API key is not bound to a project.";
      case "auth.network_error":
        return "Network error. Could not reach the server.";
      default:
        return key;
    }
  }
</script>

<div class="space-y-3">
  <div class="space-y-1">
    <Label for="settings-api-url">API URL</Label>
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
    <Label for="settings-api-key">API Key</Label>
    <div class="flex items-center gap-1">
      <Input
        id="settings-api-key"
        type={showKey ? "text" : "password"}
        placeholder="tgpat_..."
        bind:value={form.apiKey}
        class="flex-1"
      />
      <button
        type="button"
        onclick={() => (showKey = !showKey)}
        class="h-7 w-7 inline-flex items-center justify-center rounded text-text-secondary hover:bg-(--figma-color-bg-hover)"
        aria-label={showKey ? "Hide API key" : "Show API key"}
      >
        {#if showKey}
          <EyeOff size={14} />
        {:else}
          <Eye size={14} />
        {/if}
      </button>
    </div>
  </div>

  <div class="flex items-center gap-2">
    <Button
      variant="secondary"
      size="sm"
      onclick={testConnection}
      disabled={testing || !form.apiUrl || !form.apiKey}
    >
      {testing ? "Testing…" : "Test Connection"}
    </Button>
    {#if auth.value.authenticated}
      <Button variant="ghost" size="sm" onclick={disconnect}>Disconnect</Button>
    {/if}
  </div>

  {#if testResult}
    <div
      class={testResult.ok
        ? "flex items-start gap-2 rounded border border-green-300 bg-green-50 p-2 text-xs text-green-900"
        : "flex items-start gap-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-900"}
    >
      {#if testResult.ok}
        <CheckCircle2 size={14} class="mt-0.5 shrink-0" />
      {:else}
        <AlertTriangle size={14} class="mt-0.5 shrink-0" />
      {/if}
      <span>{testResult.message}</span>
    </div>
  {/if}

  {#if missingPullScope}
    <div
      class="flex items-start gap-2 rounded border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-900"
    >
      <AlertTriangle size={14} class="mt-0.5 shrink-0" />
      <span>
        API key is missing required scope:
        <code>{REQUIRED_SCOPES.pull.join(", ")}</code>
      </span>
    </div>
  {/if}
</div>
