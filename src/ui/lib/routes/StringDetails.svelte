<script lang="ts">
  import { appState } from "$ui/lib/stores/app.svelte";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { send, nextCorrelationId } from "$ui/lib/bus";
  import { ICON } from "$shared/iconSizes";
  import { Button, Input, Label, Message } from "$ui/lib/components/ui";
  import CheckboxField from "$ui/lib/components/ui/checkboxField.svelte";
  import * as Dialog from "$ui/lib/components/ui/dialog";
  import * as Tooltip from "$ui/lib/components/ui/tooltip";
  import Info from "lucide-svelte/icons/info";
  import { hasManualChange } from "$ui/lib/logic/manualChange";
  import { textOfNode } from "$ui/lib/logic/pushDiff";
  import ViewHeader from "$ui/lib/components/domain/ViewHeader.svelte";
  import ViewFooter from "$ui/lib/components/domain/ViewFooter.svelte";
  import IcuPreview from "$ui/lib/components/domain/IcuPreview.svelte";
  import ParamsEditor from "$ui/lib/components/domain/ParamsEditor.svelte";
  import IcuEditor from "$ui/lib/components/domain/IcuEditor.svelte";
  import PluralEditor from "$ui/lib/components/domain/PluralEditor.svelte";
  import {
    getVariantExample,
    getPluralCategory,
    getTolgeeFormat,
    tolgeeFormatGenerateIcu,
  } from "$shared/tolgeeFormat";
  import { renderIcuForNode } from "$shared/interpolate";
  import type { NodeInfo } from "$shared/types";

  const route = $derived(appState.value.route);
  // Follow the LIVE selection instead of the snapshot captured at navigate time:
  // show the fresh copy of the node we opened, and switch to the canvas node
  // when the selection narrows to a single other node (matching the original,
  // which re-derived the detail from `selectedNodes`). The prefill effect below
  // offers to save unsaved edits before switching.
  const node = $derived.by<NodeInfo | null>(() => {
    if (route.name !== "stringDetails") return null;
    const sel = appState.value.selectedNodes;
    const anchor = route.node;
    // `sel[0]` is guaranteed by the length check; the `?? anchor` only
    // satisfies `noUncheckedIndexedAccess` and never runs.
    return sel.find((n) => n.id === anchor.id) ?? (sel.length === 1 ? (sel[0] ?? anchor) : anchor);
  });

  let translation = $state("");
  // Editable key name (namespace stays a project-level setting, shown as a
  // read-only prefix). Saving sends it back so the detail view can rename /
  // connect the node.
  let keyName = $state("");
  let isPlural = $state(false);
  // Plural variable NAME — read from the ICU (an existing key keeps its own),
  // "value" when turning a plain string into a plural. The sample COUNT is
  // edited as this variable's "Values for Figma" entry (`paramsValues[name]`).
  let pluralName = $state("value");
  let paramsValues = $state<Record<string, string>>({});

  // Tolgee formatting docs linked from the Translation (i) hint (same URL the
  // old plugin used).
  const FORMAT_DOCS_URL =
    "https://docs.tolgee.io/platform/projects_and_organizations/editing_translations";
  function openFormatDocs(): void {
    send({ type: "open-external", url: FORMAT_DOCS_URL });
  }
  // Tracks which node id we have prefilled for so the effect doesn't clobber
  // user edits on re-runs (e.g. when paramsValues updates), plus the node and a
  // baseline of its loaded values so we can detect unsaved edits when the
  // selection switches to a different node.
  let prefilledForId = $state<string | null>(null);
  let prefilledNode: NodeInfo | null = null;
  let baseline = { translation: "", keyName: "", params: "{}" };
  // A selection switch detected mid-edit, awaiting the user's Save/Discard
  // choice (see the dialog below). Holding this instead of prefilling
  // immediately is what lets us ask BEFORE overwriting the unsaved edit —
  // `confirm()` used to do this synchronously, but Figma's plugin iframe is
  // sandboxed without `allow-modals`, so `confirm()` is a silent no-op there
  // (always returns `false`) and unsaved edits were discarded without ever
  // asking. E2E ran unsandboxed and never caught it.
  let pendingSwitch = $state<{
    nextNode: NodeInfo;
    previousNode: NodeInfo;
    label: string;
  } | null>(null);

  function isDirty(): boolean {
    return (
      translation !== baseline.translation ||
      keyName !== baseline.keyName ||
      JSON.stringify(paramsValues) !== baseline.params
    );
  }

  // Loads `n`'s values into the editable fields and resets the dirty
  // baseline. Split out from the effect so both the normal selection-follow
  // path and the post-dialog resume path (`resolvePendingSwitch`) share it.
  function prefillFrom(n: NodeInfo): void {
    // Load the AUTHORITATIVE text — the exact same `textOfNode` heuristic the
    // Push diff uses — so the editor shows what will actually be uploaded. For a
    // PLAIN string that means the live canvas `characters`: a connected string
    // whose text was edited directly in Figma (e.g. a duplicated node whose copy
    // was overwritten) must show the NEW canvas text, not the stale stored
    // `translation` it inherited. ADVANCED strings still load the stored ICU
    // source (`characters` there is only its render). Previously this always
    // preferred `translation`, so a plain canvas edit showed the old text here
    // while Push correctly sent the new one — a confusing mismatch.
    translation = textOfNode(n);
    keyName = n.key ?? "";
    isPlural = n.isPlural ?? false;
    paramsValues = { ...(n.paramsValues ?? {}) };
    // Name from the ICU; "value" for a not-yet-plural string.
    pluralName = getTolgeeFormat(translation, true, false).parameter ?? "value";
    // Migrate an original-plugin plural (sample count stored in
    // `pluralParamValue` as a number, no named sample) into the editable field.
    if (
      isPlural &&
      !(pluralName in paramsValues) &&
      n.pluralParamValue &&
      /^\d+$/.test(n.pluralParamValue)
    ) {
      paramsValues = { ...paramsValues, [pluralName]: n.pluralParamValue };
    }
    if (isPlural) seedPluralValue();
    // Baseline of the freshly loaded values, so `isDirty` reflects only the
    // user's own edits from here on.
    baseline = { translation, keyName, params: JSON.stringify(paramsValues) };
    prefilledForId = n.id;
    prefilledNode = n;
  }

  // Resolves the pending Save/Discard prompt, then loads the node that
  // triggered it. Called from the dialog's buttons AND from Esc/overlay
  // (routed here as `save: true` — see the dialog's `onOpenChange` below).
  function resolvePendingSwitch(save: boolean): void {
    const pending = pendingSwitch;
    if (!pending) return;
    if (save) sendSave(pending.previousNode);
    pendingSwitch = null;
    prefillFrom(pending.nextNode);
  }

  $effect(() => {
    const n = node;
    if (!n) {
      prefilledForId = null;
      prefilledNode = null;
      // Deselecting entirely (not switching to another node) drops any
      // pending prompt too — matches the pre-existing behavior here (this
      // branch never asked before either; out of scope for this fix, which
      // only replaces the node-to-node `confirm()`).
      pendingSwitch = null;
      return;
    }
    if (prefilledForId === n.id) return;

    // Selection switched to a different node — offer to save unsaved edits to
    // the previous one before loading the new one (matches the original).
    // Defer the prefill (don't run it below) until the user answers; if the
    // selection keeps moving while the dialog is up, this just re-targets
    // `nextNode` to the newest one — `previousNode` (the actually-dirty node)
    // stays put since `prefilledNode`/`baseline` haven't changed yet.
    if (prefilledNode && isDirty()) {
      const label = baseline.keyName || prefilledNode.key || "this string";
      pendingSwitch = { nextNode: n, previousNode: prefilledNode, label };
      return;
    }

    prefillFrom(n);
  });

  // Default value for the plural variable so the Preview renders a real form
  // straight away (the locale's "other" example — 10 for en/cs, matching the
  // `#10` chip). The user can clear or change it.
  function pluralPreviewDefault(): string {
    return String(getVariantExample(language, "other") ?? 10);
  }

  // Seed the plural variable's preview value if it isn't set yet — on load of a
  // plural string, or when Plural is toggled on.
  function seedPluralValue(): void {
    const pv = pluralName || "value";
    if (!paramsValues[pv]) {
      paramsValues = { ...paramsValues, [pv]: pluralPreviewDefault() };
    }
  }

  // Turning a PLAIN string into a plural: if it has exactly ONE number > 1
  // (a genuine plural count, e.g. "6 days"), move that number into the plural
  // value and put the sentence in the "other" form with `#` in its place →
  // other "# days", value 6. None / several numbers / ≤1 → returns false so the
  // caller falls back to the default value. Skips text that's already a plural.
  function makePluralFromNumber(): boolean {
    const text = translation;
    if (/,\s*plural\b/i.test(text)) return false;
    const matches = [...text.matchAll(/\d+(?:[.,]\d+)*/g)];
    if (matches.length !== 1) return false;
    const m = matches[0];
    if (!m) return false;
    const raw = m[0];
    const num = Number(raw.replace(/,/g, ""));
    if (!Number.isFinite(num)) return false;
    const idx = m.index ?? 0;
    const body = `${text.slice(0, idx)}#${text.slice(idx + raw.length)}`;
    const pv = pluralName || "value";
    // Put the sentence in the form the number actually selects: en 1→one,
    // 6→other; cs 2→few, 5→other.
    const category = getPluralCategory(language, num);
    translation = tolgeeFormatGenerateIcu(
      { parameter: pv, variants: { [category]: body } },
      false,
    );
    paramsValues = { ...paramsValues, [pv]: String(num) };
    return true;
  }

  // Persist the current edit state onto `target` (usually the shown node, but
  // also the PREVIOUS node when the selection switched mid-edit). Does NOT
  // navigate — callers decide.
  function sendSave(target: NodeInfo): void {
    // The plural variable's sample COUNT (edited as its "Values for Figma"
    // entry) is persisted as `pluralParamValue` — a number, matching the
    // original — so pull / preview / manual-change all render the same form.
    const count = isPlural ? (paramsValues[pluralName] ?? "1") : undefined;
    // Render via the shared core so the canvas text matches pull and preview.
    // Falls back to the raw translation on parse errors so we never write
    // garbage / nothing.
    const rendered = renderIcuForNode(
      translation,
      { isPlural, translation, characters: target.characters, paramsValues, pluralParamValue: count },
      language,
    );
    const text = rendered.text || translation || target.characters;
    // apply-translations writes both `text` (TextNode.characters) and the full
    // plugin-data payload in one round-trip. The key is just WRITTEN (like the
    // bulk "Edit key name" op) — we never touch `connected`, so editing the key
    // here doesn't auto-connect an unconnected string, and saving a connected
    // string's translation doesn't disconnect it (omitting `connected` preserves
    // the node's existing state main-side).
    send({
      type: "apply-translations",
      correlationId: nextCorrelationId(),
      updates: [
        {
          id: target.id,
          text,
          translation,
          isPlural,
          pluralParamValue: count,
          paramsValues,
          key: keyName.trim(),
          ns: target.ns,
        },
      ],
    });
  }

  function save(): void {
    const n = node;
    if (!n) return;
    sendSave(n);
    appState.navigate({ name: "index" });
  }

  function cancel(): void {
    appState.navigate({ name: "index" });
  }

  // Restore the Figma canvas from the stored translation, discarding a manual
  // in-Figma edit of an advanced string. Reuses the SAME `apply-translations`
  // message Save already sends — nothing new in the main thread — but writes
  // back the *stored* translation (not the local edit state) so it's a true
  // revert. Renders with the stored params, falling back to raw on parse error.
  function revertInDesign(): void {
    const n = node;
    if (!n) return;
    const rendered = renderIcuForNode(n.translation, n, language);
    const text = rendered.text || n.translation || n.characters;
    send({
      type: "apply-translations",
      correlationId: nextCorrelationId(),
      updates: [
        {
          id: n.id,
          text,
          translation: n.translation,
          isPlural: n.isPlural,
          pluralParamValue: n.isPlural ? n.pluralParamValue : undefined,
          paramsValues: n.paramsValues ?? {},
        },
      ],
    });
    appState.navigate({ name: "index" });
  }

  const language = $derived(appState.value.config?.language ?? "en");

  // Advanced connected string whose canvas text was edited directly in Figma →
  // diverged from the stored translation (formatting lost). Read-only; surfaces
  // warning + revert.
  const manualChange = $derived(node ? hasManualChange(node, language) : false);

  // Advanced format = plural OR has ICU params OR inline markup. When it's
  // advanced but NOT a manual-change divergence, we show a calm teal NOTICE
  // (vs the red warning) so the user knows to edit it via the plugin.
  const isAdvanced = $derived(
    isPlural ||
      /\{[^}]*\}/.test(translation) ||
      /<\/?[a-z][^>]*>/i.test(translation),
  );
  const showAdvancedNotice = $derived(!manualChange && isAdvanced);

  // How many editable "Values for Figma" the translation has (named ICU params,
  // incl. the plural variable) — drives the side-by-side values+preview layout.
  const figmaParamCount = $derived.by(() => {
    const re = /\{(\w+)(?:,[^}]*)?\}/g;
    const names = new Set<string>();
    let m: RegExpExecArray | null;
    while ((m = re.exec(translation)) !== null) {
      const name = m[1];
      if (!name || name === "#" || /^\d+$/.test(name)) continue;
      names.add(name);
    }
    return names.size;
  });
</script>

{#if !node}
  <div class="p-4 text-xs text-text-secondary">No node selected.</div>
{:else}
  <div class="flex flex-col h-full">
    <ViewHeader title="String details" onBack={cancel} />

    <div class="flex-1 overflow-auto p-3 space-y-3">
      <Tooltip.Provider delayDuration={200}>
      {#if manualChange}
        <!-- Icon aligned to the first text line; text sits beside it. The Revert
             action gets an outlined solid-surface button so it reads clearly on
             the red tint (a plain secondary button blended in). -->
        <Message variant="error" class="items-start! gap-2">
          <div class="flex flex-col items-start gap-2">
            <p class="leading-snug">
              This string was edited in Figma and no longer matches its
              formatting. Revert to restore it.
            </p>
            <Button
              size="sm"
              variant="outline"
              class="bg-bg!"
              onclick={revertInDesign}
            >
              Revert string in design
            </Button>
          </div>
        </Message>
      {:else if showAdvancedNotice}
        <!-- Calm teal notice: the string is advanced (plural / params / markup)
             but not diverged — just a heads-up to edit it via the plugin. -->
        <Message variant="secondary" icon={Info}>
          Advanced text format detected. Edit the string via the plugin to
          preserve formatting.
        </Message>
      {/if}

      <div>
        <Label for="string-details-key">Key</Label>
        <div class="mt-1 flex items-center gap-1">
          {#if node.ns && auth.value.namespacesEnabled}
            <span class="shrink-0 font-mono text-xs text-text-secondary">
              {node.ns}.
            </span>
          {/if}
          <Input
            id="string-details-key"
            bind:value={keyName}
            placeholder="Key name"
            class="w-full font-mono"
          />
        </div>
      </div>

      <!-- Plural on its own row (checkbox-left). Locked for connected keys —
           change it in Tolgee. -->
      <CheckboxField
        label="Plural"
        checked={isPlural}
        onChange={(v) => {
          isPlural = v;
          // Toggling on: try to seed from a single >1 number in the text;
          // otherwise fall back to the default preview value.
          if (v && !makePluralFromNumber()) seedPluralValue();
        }}
        disabled={node.connected}
      >
        {#snippet trailing()}
          {#if node.connected}
            <Tooltip.Root>
              <Tooltip.Trigger>
                {#snippet child({ props })}
                  <span
                    {...props}
                    class="text-text-secondary transition-colors hover:text-text-brand"
                    role="button"
                    tabindex={-1}
                    aria-label="Why plural is locked"
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
                You can't change this here. Change it in your Tolgee platform.
              </Tooltip.Content>
            </Tooltip.Root>
          {/if}
        {/snippet}
      </CheckboxField>

      <div class="flex items-center gap-1.5">
        <Label>Translation ({language})</Label>
        <Tooltip.Root>
          <Tooltip.Trigger>
            {#snippet child({ props })}
              <span
                {...props}
                class="text-text-secondary transition-colors hover:text-text-brand"
                role="button"
                tabindex={-1}
                aria-label="Formatting help"
              >
                <Info size={ICON.inline} />
              </span>
            {/snippet}
          </Tooltip.Trigger>
          <Tooltip.Content
            side="bottom"
            align="start"
            class="max-w-[17rem] space-y-1.5 leading-snug"
          >
            <p>
              You can use basic HTML tags such as
              <code>&lt;strong&gt;</code>, <code>&lt;b&gt;</code>,
              <code>&lt;em&gt;</code>, <code>&lt;i&gt;</code>,
              <code>&lt;u&gt;</code>, <code>&lt;br&gt;</code> and also parameters
              as <code>&#123;parameter&#125;</code> and <code>#</code> as plural
              placeholder.
            </p>
            <button
              type="button"
              class="text-text-brand hover:underline"
              onclick={openFormatDocs}
            >
              Read the docs
            </button>
          </Tooltip.Content>
        </Tooltip.Root>
      </div>

      {#if isPlural}
        <div class="mt-1">
          <PluralEditor
            bind:value={translation}
            locale={language || "en"}
            parameter={pluralName || "value"}
          />
        </div>
      {:else}
        <div class="mt-1">
          <IcuEditor
            id="string-details-translation"
            bind:value={translation}
            rows={4}
            placeholder="Translation…"
          />
        </div>
      {/if}

      <!-- Values for Figma + Preview side by side (like the old plugin); preview
           alone full-width when there are no params to fill. -->
      {#if figmaParamCount > 0}
        <div class="flex gap-3">
          <div class="min-w-0 flex-1">
            <ParamsEditor
              {translation}
              values={paramsValues}
              onChange={(v) => (paramsValues = v)}
            />
          </div>
          <div class="min-w-0 flex-1">
            <!-- h-full so the grey preview box matches the params column height. -->
            <IcuPreview
              {translation}
              params={paramsValues}
              {language}
              class="h-full"
            />
          </div>
        </div>
      {:else}
        <IcuPreview {translation} params={paramsValues} {language} />
      {/if}
      </Tooltip.Provider>
    </div>

    <ViewFooter onCancel={cancel} confirmLabel="Save" onConfirm={save} />
  </div>
{/if}

<!-- Save/Discard prompt for a selection switch mid-edit (replaces the
     `confirm()` that Figma's sandboxed iframe silently no-ops). Esc/overlay
     is routed to Save, not Discard — a dismiss gesture must never be the
     thing that silently throws away an edit. -->
<Dialog.Root
  open={pendingSwitch !== null}
  onOpenChange={(open) => {
    if (!open) resolvePendingSwitch(true);
  }}
>
  <Dialog.Content class="max-w-sm">
    <Dialog.Title class="text-sm font-semibold text-text">
      Unsaved changes
    </Dialog.Title>
    <p class="mt-2 text-xs text-text-secondary">
      You have unsaved changes for "{pendingSwitch?.label}". Save them?
    </p>
    <div class="mt-4 flex justify-end gap-2">
      <Button
        variant="outline"
        size="sm"
        onclick={() => resolvePendingSwitch(false)}
      >
        Discard
      </Button>
      <Button size="sm" onclick={() => resolvePendingSwitch(true)}>
        Save
      </Button>
    </div>
  </Dialog.Content>
</Dialog.Root>
