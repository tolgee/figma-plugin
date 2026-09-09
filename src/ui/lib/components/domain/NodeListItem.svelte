<script lang="ts">
  import type { NodeInfo } from "$shared/types";
  import { ICON } from "$shared/iconSizes";
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import NamespaceInput from "$ui/lib/components/ui/namespaceInput.svelte";
  import Input from "$ui/lib/components/ui/input.svelte";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { queueNodeSave, cancelNodeSave } from "$ui/lib/logic/saveQueue";
  import { hasRichFormat } from "$ui/lib/logic/icuParams";
  import * as DropdownMenu from "$ui/lib/components/ui/dropdown-menu";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import Badge from "$ui/lib/components/ui/badge.svelte";
  import IconButton from "$ui/lib/components/ui/iconButton.svelte";
  import TooltipIconButton from "$ui/lib/components/ui/tooltipIconButton.svelte";
  import StatusMarker from "$ui/lib/components/ui/statusMarker.svelte";
  import { cn } from "$ui/lib/utils";
  import KeyRound from "lucide-svelte/icons/key-round";
  import EllipsisVertical from "lucide-svelte/icons/ellipsis-vertical";
  import FileText from "lucide-svelte/icons/file-text";
  import Target from "lucide-svelte/icons/target";
  import Link2 from "lucide-svelte/icons/link-2";
  import Link2Off from "lucide-svelte/icons/link-2-off";
  import Copy from "lucide-svelte/icons/copy";
  import Check from "lucide-svelte/icons/check";
  import ExternalLink from "lucide-svelte/icons/external-link";
  import PenOff from "lucide-svelte/icons/pen-off";
  import { buildKeyDeepLink } from "$ui/lib/logic/deeplink";
  import { copyToClipboard } from "$ui/lib/clipboard";
  import { namespacedKeyLabel } from "$ui/lib/logic/namespaces";
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";
  import Checkbox from "$ui/lib/components/ui/checkbox.svelte";

  type Props = {
    node: NodeInfo;
    /** How many nodes in the selection share this node's source string. */
    duplicateCount?: number;
    /** Apply an exact-text filter to the list (duplicate-badge click). */
    onFilterText?: () => void;
    /** Apply an exact-key filter to the list (conflict-warning click). */
    onFilterKey?: () => void;
    /** Bulk selection — the row's checkbox is always shown; these drive it. */
    selected?: boolean;
    onToggleSelect?: () => void;
    /** How many strings share this node's key with DIFFERENT text (>1 = push
     *  conflict; only one uploads). Drives a clickable "filter to these" badge. */
    conflictCount?: number;
    /** Advanced string (plural/params/markup) edited directly in Figma so its
     *  canvas text diverged from the stored translation — resolve in details. */
    manualChange?: boolean;
    /** Connected, but its key no longer exists in the Tolgee project (deleted on
     *  the web) — the link is stale and shown as an error. */
    keyMissing?: boolean;
    /** Namespace options for the inline picker — computed ONCE by the list
     *  owner (server + locally used + default). Computing it per row walked
     *  the whole selection from every row: O(n²) on large selections. */
    namespaceNames?: string[];
  };
  let {
    node,
    duplicateCount = 1,
    selected = false,
    onToggleSelect,
    conflictCount = 0,
    manualChange = false,
    keyMissing = false,
    onFilterText,
    onFilterKey,
    namespaceNames = [],
  }: Props = $props();

  // Local edit state for unconnected nodes. Connected nodes are read-only here
  // (deeper editing happens in StringDetails / Connect).
  let key = $state("");
  let ns = $state("");

  // True while the user is typing in this row's key input — used to avoid
  // re-hydrating (and clobbering their edit) underneath them.
  let editing = $state(false);

  // Re-hydrate the local key/ns inputs from the node's PERSISTED key / ns /
  // connected. This mirrors external changes (bulk "Edit key name",
  // connect/disconnect) immediately. Skipped while `editing` so live typing
  // isn't overwritten. The prefill SUGGESTION is handled by the effect below.
  let hydratedSig = $state<string | null>(null);

  $effect(() => {
    const n = node;
    const sig = `${n.id} ${n.connected ? 1 : 0} ${n.key ?? ""} ${n.ns ?? ""}`;
    if (sig === hydratedSig || editing) return;
    hydratedSig = sig;
    key = n.key ?? "";
    ns = n.ns ?? appState.value.config?.namespace ?? "";
  });

  // NOTE: the key PREFILL is no longer decided here. Rows are re-mounted by
  // the virtualized list on scroll, so a per-row decision would re-apply
  // prefills the user explicitly cleared. Index decides once per node per
  // session (see `pendingPrefills`) and the persisted key arrives back through
  // the normal hydration effect above.

  // Auto-save for inline edits on unconnected nodes. Saves go through the
  // shared queue, which coalesces the whole selection's edits (150 prefills,
  // rapid keystrokes) into ONE debounced `set-nodes-data` message — per-row
  // timers used to fire one write per row, and every write triggered a full
  // selection re-scan on the main thread.
  function scheduleSave(): void {
    if (node.connected) return;
    const trimmedKey = key.trim();
    const trimmedNs = ns.trim();
    // Normalise undefined/"" (both = the "<none>" default namespace) when
    // deciding whether anything changed, so untouched rows don't churn.
    // Landing back on the persisted value also drops any queued intermediate
    // edit for this row.
    if (trimmedKey === (node.key ?? "") && trimmedNs === (node.ns ?? "")) {
      cancelNodeSave(node.id);
      return;
    }
    // Persist "" for an explicit "<none>" (not undefined) so re-hydration
    // doesn't snap it back to the configured default namespace.
    queueNodeSave(node.id, { key: trimmedKey, ns: trimmedNs, connected: false });
  }

  function handleKeyInput(e: Event): void {
    key = (e.currentTarget as HTMLInputElement).value;
    scheduleSave();
  }

  function handleNamespaceChange(v: string): void {
    ns = v;
    scheduleSave();
  }

  // Reveal the node on the Figma canvas (scroll + zoom). Deliberately an
  // explicit action only — navigating to Connect/String details no longer
  // moves the canvas, so the user's viewport doesn't shift under their hands.
  function showOnCanvas(): void {
    send({ type: "scroll-to-node", id: node.id });
  }

  function openConnectView(): void {
    appState.navigate({ name: "connect", node });
  }

  // Quick disconnect straight from the list — clears the key mapping so the
  // user doesn't have to open the Connect view just to unlink.
  function disconnect(): void {
    // A debounced inline edit for this row may still be queued — drop it, or
    // its later flush would resurrect the key we're clearing right now.
    cancelNodeSave(node.id);
    send({
      type: "set-nodes-data",
      correlationId: nextCorrelationId(),
      nodes: [
        // "" (not undefined) to actually CLEAR the namespace — undefined is
        // dropped by the bus's JSON round-trip, leaving the old ns behind.
        { id: node.id, info: { key: "", ns: "", connected: false } },
      ],
    });
  }

  function openStringDetails(): void {
    appState.navigate({ name: "stringDetails", node });
  }

  // ---- Dev-Mode-only menu actions (the deleted minipanel's replacements) ---
  // Design mode deliberately doesn't get these: a designer copies straight
  // off the canvas or the key input; these serve a developer pasting the key
  // or the SOURCE ICU string into code.
  const isDev = $derived(appState.value.editorType === "dev");

  /** Flashes the row's ⋮ trigger to a checkmark for a moment after a copy —
   *  in-panel confirmation alongside the `notify` toast below, which renders
   *  on the CANVAS (figma.notify), easy to miss while looking at the plugin
   *  panel instead. The effect re-arms its own timeout on every re-trigger
   *  and clears the previous one, so copying twice in quick succession just
   *  restarts the flash instead of stacking timers. */
  let justCopied = $state(false);
  $effect(() => {
    if (!justCopied) return;
    const timer = setTimeout(() => {
      justCopied = false;
    }, 1200);
    return () => clearTimeout(timer);
  });

  /** Minipanel's key format: `ns.key` when a namespace is set, plain `key`
   *  otherwise — `namespacedKeyLabel` with the gate forced open, because a
   *  clipboard copy is about data fidelity (what the key IS), not display
   *  preference (what Settings wants shown). */
  function copyKey(): void {
    const label = namespacedKeyLabel(node.ns, node.key, true);
    if (!label) return;
    runCopy(label, "Key copied");
  }

  /** Copies the FULL source ICU string (`{count, plural, ...}`), not the
   *  rendered canvas text — the canvas only shows one rendered form, and the
   *  source pattern is exactly what a developer needs in code and can't get
   *  anywhere else in Dev Mode. Labelled "Copy string" (not "translation") to
   *  match the plugin's "strings" vocabulary and read naturally for devs. */
  function copyString(): void {
    if (!node.translation) return;
    runCopy(node.translation, "String copied");
  }

  /** Copy via the sandbox-safe helper, then confirm — flash the ⋮ trigger and
   *  toast on success, an error toast if even the fallback couldn't copy.
   *
   *  Deferred a tick with setTimeout: this runs from the dropdown item's
   *  `onSelect`, and bits-ui returns focus to the trigger SYNCHRONOUSLY as the
   *  menu closes — that focus yank races with the copy and Figma's iframe
   *  silently drops the write (execCommand reports success, clipboard keeps its
   *  old contents). One tick later the menu has torn down and focus has settled
   *  back into the iframe, so the trusted copy event actually lands. The click
   *  keeps transient activation alive well past a 0ms timeout, so execCommand
   *  is still permitted. (Ref: radix-ui/primitives#2676.) */
  function runCopy(text: string, okText: string): void {
    setTimeout(async () => {
      if (await copyToClipboard(text)) {
        send({ type: "notify", text: okText });
        justCopied = true;
      } else {
        send({ type: "notify", text: "Couldn't copy to clipboard.", error: true });
      }
    }, 0);
  }

  function openInTolgee(): void {
    const url = buildKeyDeepLink(appState.value.config, node);
    if (!url) return;
    send({ type: "open-external", url });
  }

  // Deferred interactivity: the bits-ui tooltip/menu wrappers are the heavy
  // half of a row's mount cost, and they only matter once the pointer (or
  // keyboard focus) actually reaches the row. Until then visually identical
  // plain twins render — same markup, same click handlers, no floating-ui
  // machinery. The upgrade fires on ROW enter, i.e. before any child can be
  // hovered, so a tooltip can never be missed.
  let interactive = $state(false);

  function formatConnected(n: NodeInfo): string {
    return n.key || "(no key)";
  }

  // The namespace label shown as a pill next to a connected key — mirrors
  // Tolgee, which groups keys without a namespace under an explicit "<none>".
  function formatNamespace(n: NodeInfo): string {
    return n.ns || "<none>";
  }
</script>

<li
  class="group flex items-start gap-1.5 border-b border-dashed border-border px-3 py-2.5 transition-colors last:border-b-0 hover:bg-text/[0.03]"
  onpointerenter={() => (interactive = true)}
  onfocusin={() => (interactive = true)}
>
  <div class="min-w-0 flex-1 space-y-1.5">
    <!-- Source text (opens String details) + status badges. The leading 16px
         cell holds the always-on selection checkbox, sitting directly above the
         key glyph below — the string text aligns with the key and never shifts.
         Unchecked checkboxes stay light/subtle until the row is hovered. -->
    <div class="flex items-center gap-1.5">
      <span class="flex h-4 w-4 shrink-0 items-center justify-center">
        <button
          type="button"
          aria-label="Select string"
          aria-pressed={selected}
          onclick={onToggleSelect}
          class="rounded-sm focus:outline-none"
        >
          <Checkbox
            checked={selected}
            class={selected
              ? ""
              : "opacity-50 transition-opacity group-hover:opacity-100"}
          />
        </button>
      </span>
      <button
        type="button"
        class="min-w-0 truncate text-left text-xs text-text hover:underline"
        title={node.characters}
        onclick={openStringDetails}
      >
        {node.characters || "(empty)"}
      </button>
      {#if node.isPlural}
        <Badge>Plural</Badge>
      {/if}
      {#if hasRichFormat(node)}
        <!-- Not plain text: has ICU params ({name}) or inline markup (<b>, <i>).
             Flagged like Plural so it's clear it shouldn't be edited raw. -->
        <Badge>Formatted</Badge>
      {/if}
      {#if duplicateCount > 1}
        <!-- Frontend-only duplicate flag: N layers in the selection share this
             exact text. Click to search/filter to all of them. -->
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <button
                {...props}
                type="button"
                onclick={onFilterText}
              >
                <Badge
                  class="gap-0.5 transition-colors hover:border-secondary hover:text-secondary"
                >
                  <Copy size={ICON.badge} />
                  {duplicateCount}
                </Badge>
              </button>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content side="bottom">Click to filter identical strings</Tooltip.Content>
        </Tooltip.Root>
      {/if}
      {#if conflictCount > 1}
        <!-- Same key, different text → only the first uploads. A WARNING icon
             (not a key — the row already has a key glyph below, two keys read as
             chaos). Click filters the list to every string on this key so they
             can be fixed together. -->
        <StatusMarker
          label={`This key is used by ${conflictCount} strings with different text — only one will upload. Click to filter to them.`}
          onclick={onFilterKey}
        >
          <AlertTriangle size={ICON.marker} />
        </StatusMarker>
      {/if}
      {#if manualChange}
        <!-- Stored translation diverged from the Figma canvas text (edited
             straight in Figma). Click to resolve in String details. -->
        <StatusMarker
          label="Advanced text format edited directly in Figma — its formatting may be lost. Open String details to resolve."
          onclick={openStringDetails}
        >
          <PenOff size={ICON.marker} />
        </StatusMarker>
      {/if}
    </div>

    <!-- Key glyph + name. Connected = secondary-coloured (a positive STATE, not
         an action — actions stay brand-pink) and opens Connection detail;
         unconnected shows an editable key input. -->
    <div class="flex items-center gap-1.5">
      <!-- Key glyph turns red when the linked key was deleted in Tolgee (stale
           link); otherwise secondary when connected, muted when not. -->
      <KeyRound
        size={ICON.inline}
        class={cn(
          "shrink-0",
          keyMissing
            ? "text-error"
            : node.connected
              ? "text-secondary"
              : "text-icon-muted",
        )}
      />
      {#if node.connected}
        {#if interactive}
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <button
                  {...props}
                  type="button"
                  class={cn(
                    "min-w-0 truncate text-left text-xs font-semibold hover:underline",
                    keyMissing ? "text-error" : "text-secondary",
                  )}
                  onclick={openConnectView}
                >
                  {formatConnected(node)}
                </button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content side="bottom" align="start">
              {#if keyMissing}
                This key is no longer in Tolgee: {formatConnected(node)}
              {:else}
                Connected to key: {formatConnected(node)}
              {/if}
            </Tooltip.Content>
          </Tooltip.Root>
          <!-- Namespace pill (own tooltip), incl. an explicit "<none>". Only
               shown when the project actually has namespaces enabled — with
               it off, the concept doesn't apply to anything the user sees,
               so a "no namespace" pill is just noise/confusion (data isn't
               affected, this is display-only). -->
          {#if auth.value.namespacesEnabled}
            <Tooltip.Root>
              <Tooltip.Trigger>
                {#snippet child({ props })}
                  <span {...props}><Badge>ns:{formatNamespace(node)}</Badge></span>
                {/snippet}
              </Tooltip.Trigger>
              <Tooltip.Content side="bottom">
                {node.ns ? `Namespace: ${node.ns}` : "No namespace"}
              </Tooltip.Content>
            </Tooltip.Root>
          {/if}
        {:else}
          <!-- Plain twins of the two tooltip wrappers above — same look, same
               click, upgraded on row hover/focus before a tooltip could open. -->
          <button
            type="button"
            class={cn(
              "min-w-0 truncate text-left text-xs font-semibold hover:underline",
              keyMissing ? "text-error" : "text-secondary",
            )}
            onclick={openConnectView}
          >
            {formatConnected(node)}
          </button>
          {#if auth.value.namespacesEnabled}
            <span><Badge>ns:{formatNamespace(node)}</Badge></span>
          {/if}
        {/if}
      {:else}
        <!-- Shared Input component (not a raw <input>) so its height always
             matches the namespace Select beside it. -->
        <Input
          type="text"
          class="min-w-0 flex-1"
          placeholder="Key name"
          value={key}
          oninput={handleKeyInput}
          onfocus={() => (editing = true)}
          onblur={() => (editing = false)}
        />
        {#if auth.value.namespacesEnabled}
          <!-- Namespace for the NEW key, prefilled with the default ("<none>"
               when unset). Editable per row. -->
          <NamespaceInput
            value={ns}
            options={namespaceNames}
            onChange={handleNamespaceChange}
            class="w-[35%] shrink-0"
          />
        {/if}
      {/if}
    </div>
  </div>

  <!-- Actions: connect/disconnect kept outside, then the overflow menu. -->
  <div class="flex shrink-0 items-center gap-0.5">
    {#if interactive}
      {#if node.connected}
        <TooltipIconButton label="Disconnect" onclick={disconnect}>
          <Link2Off size={ICON.inline} />
        </TooltipIconButton>
      {:else}
        <TooltipIconButton label="Connect to key" onclick={openConnectView}>
          <Link2 size={ICON.inline} />
        </TooltipIconButton>
      {/if}

      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          {#snippet child({ props })}
            <IconButton {...props} aria-label="More actions">
              {#if justCopied}
                <Check size={ICON.inline} class="text-success" />
              {:else}
                <EllipsisVertical size={ICON.inline} />
              {/if}
            </IconButton>
          {/snippet}
        </DropdownMenu.Trigger>
        <DropdownMenu.Content align="end">
          {#if !isDev}
            <!-- String details edits the string — design-only. Production's
                 dev row menu keeps just "Move to String" too; even if this
                 were missed, navigate()'s route gate refuses the route. -->
            <DropdownMenu.Item onSelect={openStringDetails}>
              <FileText size={ICON.inline} /> String details
            </DropdownMenu.Item>
          {/if}
          <DropdownMenu.Item onSelect={showOnCanvas}>
            <Target size={ICON.inline} /> Move to string
          </DropdownMenu.Item>
          {#if node.connected}
            <DropdownMenu.Item onSelect={openConnectView}>
              <Link2 size={ICON.inline} /> Connection detail
            </DropdownMenu.Item>
          {/if}
          {#if isDev}
            <!-- Minipanel replacements, dev-only (see the handlers' docs). -->
            {#if node.key}
              <DropdownMenu.Item onSelect={copyKey}>
                <Copy size={ICON.inline} /> Copy key
              </DropdownMenu.Item>
            {/if}
            {#if node.translation}
              <DropdownMenu.Item onSelect={copyString}>
                <Copy size={ICON.inline} /> Copy string
              </DropdownMenu.Item>
            {/if}
            {#if node.connected}
              <DropdownMenu.Item onSelect={openInTolgee}>
                <ExternalLink size={ICON.inline} /> Open in Tolgee
              </DropdownMenu.Item>
            {/if}
          {/if}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    {:else}
      <!-- Plain twins: same icon buttons without the tooltip/menu machinery.
           The row upgrades on pointerenter/focusin — before a click or hover
           can land — so these only ever cover the untouched-row state. -->
      {#if node.connected}
        <IconButton aria-label="Disconnect" onclick={disconnect}>
          <Link2Off size={ICON.inline} />
        </IconButton>
      {:else}
        <IconButton aria-label="Connect to key" onclick={openConnectView}>
          <Link2 size={ICON.inline} />
        </IconButton>
      {/if}
      <IconButton aria-label="More actions">
        <EllipsisVertical size={ICON.inline} />
      </IconButton>
    {/if}
  </div>
</li>
