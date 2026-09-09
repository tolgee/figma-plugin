<script lang="ts">
  import { Message } from "$ui/lib/components/ui";
  import Info from "lucide-svelte/icons/info";

  // Reference catalogue of all user-facing COPY (messages, tooltips, empty
  // states, hints, placeholders, notable buttons) with WHERE each is shown.
  // Hand-maintained from a sweep of `src/ui` — keep in sync when copy changes.
  // `variant` (Messages group) renders the row as the REAL Message component so
  // its icon + colour show (incl. theme-aware light/dark tinting). `icon:
  // "info"` overrides a secondary message's default check with the Info glyph
  // (the teal notice).
  type MsgVariant = "error" | "success" | "info" | "secondary" | "warning";
  type Entry = {
    text: string;
    where: string;
    variant?: MsgVariant;
    icon?: "info";
  };
  type Group = {
    title: string;
    note?: string;
    render?: "message";
    items: Entry[];
  };

  const groups: Group[] = [
    {
      title: "Messages & banners",
      note: "Inline status blocks shown in their real colour + icon.",
      render: "message",
      items: [
        {
          variant: "error",
          text: "Multiple different texts use the same key ({keys}). Only one will upload — give each a different key.",
          where: "Index.svelte · top of list when ≥2 different Figma texts share one key",
        },
        {
          variant: "warning",
          text: 'Branch "{branch}" no longer exists. Please select a different branch.',
          where: "Index.svelte · warning banner when the configured branch was deleted in Tolgee (+ inline branch re-pick Select and Refresh branches button; shown even with nothing selected)",
        },
        {
          variant: "error",
          text: "Advanced text format detected. Edit the string via plugin to preserve formatting.",
          where: "StringDetails.svelte · RED warning when a connected advanced string was edited directly in Figma (+ “Revert string in design” button)",
        },
        {
          variant: "secondary",
          icon: "info",
          text: "Advanced text format detected. Edit the string via the plugin to preserve formatting.",
          where: "StringDetails.svelte · TEAL notice (Message secondary + Info) when the string is advanced but not diverged",
        },
        {
          variant: "warning",
          text: "{n} key(s) reuse the same name with different text in Figma. Only the first occurrence will be pushed for each. Update or disconnect the duplicates to clear this warning.",
          where: "Push.svelte · yellow warning on Upload preview",
        },
        {
          variant: "error",
          text: "{n} unresolved conflict(s) — Pick a resolution for each conflict and re-submit.",
          where: "Push.svelte · conflict stage",
        },
        {
          variant: "info",
          text: "No changes to upload.",
          where: "Push.svelte · diff empty and no screenshot-only upload",
        },
        {
          variant: "info",
          text: "No connected strings to upload.",
          where: "Push.svelte · selection has no strings connected to a Tolgee key (empty frame, all-ignored, or unconnected texts) — the diff query is gated off",
        },
        {
          variant: "success",
          text: "Uploaded {n} new and {m} updated key(s) to Tolgee. {k} screenshot(s) uploaded.",
          where: "Push.svelte · done stage — success summary; collapses to just the new / just the updated / just the screenshot line as applicable (a screenshot-only upload shows no key count). Canvas toast is separate — see Toasts.",
        },
        {
          variant: "warning",
          text: "Translations were pushed, but tag update failed: {…}",
          where: "Push.svelte · post-push tag failure (severity: warning)",
        },
        {
          variant: "error",
          text: "Failed to compute diff.",
          where: "Push.svelte · Upload preview when the diff query fails to load (fallback; the underlying error message is shown when present)",
        },
        {
          variant: "success",
          text: "Everything is up to date.",
          where: "Pull.svelte · no changed nodes",
        },
        {
          variant: "error",
          text: "Cannot scan the page. / Cannot load translations. / Invalid project API key. / No language selected. / Not connected to Tolgee.",
          where: "Pull.svelte · error stage — page-scan or translations query failed, or a precondition is missing (specific fallbacks layered above the generic “Something went wrong.”; “Not connected to Tolgee.” also appears in CopyView/CreateCopy)",
        },
        {
          variant: "secondary",
          text: "{projectName} was successfully connected",
          where: "SettingsSectionConnection.svelte · after connecting",
        },
        {
          variant: "error",
          text: "Please enter the Tolgee URL and project API key. / Invalid API key. / Request failed. Please check the Tolgee URL. / API key is not bound to a project. / Network error. Could not reach the server.",
          where: "SettingsSectionConnection.svelte · connect errors (errorToHuman)",
        },
        {
          variant: "error",
          text: "API key is missing required scope: {scope}",
          where: "SettingsSectionConnection.svelte · connected key lacks pull scope",
        },
        {
          variant: "warning",
          text: "Using insecure http:// — consider https:// in production.",
          where: "SettingsSectionConnection.svelte · non-localhost http URL",
        },
        {
          variant: "error",
          text: "ICU error: {message}",
          where: "IcuPreview.svelte · ICU fails to parse",
        },
        {
          variant: "info",
          text: "The original page changed since this copy was made.",
          where: "CopyView.svelte · staleness banner (+ \"Recreate copy\" button, hidden in Dev Mode)",
        },
        {
          variant: "error",
          text: "Something went wrong.",
          where: "CopyView.svelte, CreateCopy.svelte, Pull.svelte · fallback error text with no specific message",
        },
      ],
    },
    {
      title: "Tooltips",
      note: "Hover/aria text — Tooltip.Content, and StatusMarker / TooltipIconButton labels.",
      items: [
        {
          text: "Click to filter identical strings",
          where: "NodeListItem.svelte · duplicate-count badge",
        },
        {
          text: "This key is used by {n} strings with different text — only one will upload. Click to filter to them.",
          where: "NodeListItem.svelte · conflict warning icon (StatusMarker)",
        },
        {
          text: "Advanced text format edited directly in Figma — its formatting may be lost. Open String details to resolve.",
          where: "NodeListItem.svelte · manual-change (pen-off) icon (StatusMarker)",
        },
        {
          text: "Connected to key: {ns.key}",
          where: "NodeListItem.svelte · connected row key name",
        },
        {
          text: "Disconnect / Connect to key",
          where: "NodeListItem.svelte · row action icon",
        },
        {
          text: "Cancel selection",
          where: "Index.svelte · bulk-selection ✕",
        },
        {
          text: "What “{label}” does",
          where: "Index.svelte · (i) info trigger in filter dropdown",
        },
        {
          text: "Create a duplicate of this page (per language or with raw keys)",
          where: "Header.svelte · create-page-copy button",
        },
        {
          text: "Copies follow the branch set in Settings.",
          where: "CreateCopy.svelte, CopyView.svelte · disabled (read-only) branch Select on branching projects — the branch is changed in Settings, not per copy",
        },
        {
          text: "Open plugin settings",
          where: "Header.svelte · settings button",
        },
        {
          text: "You can use basic HTML tags such as <strong>, <b>, <em>, <i>, <u>, <br> and also parameters as {parameter} and # as plural placeholder. (Read the docs)",
          where: "StringDetails.svelte · Translation (i)",
        },
        {
          text: "You can't change this here. Change it in your Tolgee platform.",
          where: "StringDetails.svelte · Plural (i) when the key is connected",
        },
        {
          text: "These values are only used to preview the translation in Figma. They won't be saved.",
          where: "ParamsEditor.svelte · Values for Figma (i)",
        },
      ],
    },
    {
      title: "Empty / idle states",
      items: [
        {
          text: "Select strings for translation — Pick frames or texts. Fewer runs smoother.",
          where: "Index.svelte · nothing selected",
        },
        {
          text: "Not connected",
          where: "Header.svelte · header subtitle when unauthenticated",
        },
        {
          text: "Connect to Tolgee for languages…",
          where: "Header.svelte · in place of the language select, authenticated but languages not loaded yet",
        },
        {
          text: "Nothing to translate here",
          where: "Index.svelte · selection has no translatable strings",
        },
        {
          text: "No strings match your search — Try another word.",
          where: "Index.svelte · search/filter empty",
        },
        {
          text: "Sign in to connect this document with Tolgee.",
          where: "Index.svelte · unauthenticated",
        },
        {
          text: "Searching… / No matching key in Tolgee (Searched key names and source text. Try another word.) / Search for an existing key (Type a string or key name.)",
          where: "Connect.svelte · key search states",
        },
        {
          text: "No node selected.",
          where: "Connect.svelte, StringDetails.svelte · no node in route",
        },
      ],
    },
    {
      title: "Filter hints (i)",
      note: "Index filter dropdown — option labels + their (i) tooltip bodies.",
      items: [
        {
          text: "ignore numbers — Skips number-only strings. Digits, spaces and . , + - count. “1,234.00” is ignored. “12 apples” is kept.",
          where: "Index.svelte · ignoreOptions",
        },
        {
          text: "ignore hidden layers — Skips text layers that are hidden in Figma. (+ “More options in Settings” link)",
          where: "Index.svelte · ignoreOptions",
        },
        {
          text: "ignore strings with prefix — Skips layers whose name starts with the prefix set in Settings → Strings and Keys.",
          where: "Index.svelte · ignoreOptions",
        },
        {
          text: "hide connected strings",
          where: "Index.svelte · filter dropdown (shows a “hide connected ✕” chip when on)",
        },
        {
          text: "Show only — conflicting keys ({n}) / duplicate strings ({n})",
          where: "Index.svelte · filter dropdown second section (chips: “only conflicting keys ✕”, “only duplicate strings ✕”)",
        },
      ],
    },
    {
      title: "Settings → Strings and Keys hints (i)",
      note: "Per-row (i) tooltips in the Strings-and-Keys settings tab.",
      items: [
        {
          text: "Key format — Define your key format to be consistent and fast. You can use variables, text and separators. Variables use names from your Figma structure: element name, element text · frame, group, component, artboard, section · separators like . : _ -. Read more in our guide → How to name translation keys (brand link).",
          where: "SettingsSectionKeys.svelte · Key format (i)",
        },
        {
          text: "Formatting style — This will help you preserve the same format style. Your style is automatically applied to the variables. E.g. style element_name: \"My cool button\" → my_cool_button.",
          where: "SettingsSectionKeys.svelte · Formatting style (i)",
        },
        {
          text: "Numbers — Skips strings made only of numbers — digits, spaces and the formatting characters . , + -. So \"100\", \"1,234.00\" and \"+420\" are ignored, but \"12 apples\" is kept.",
          where: "SettingsSectionSync.svelte · Numbers (i)",
        },
        {
          text: "Hidden layers — Skips layers with visibility turned off in Figma. With \"Including all child texts\" enabled, all text layers inside hidden layers are also ignored, even if individually set to visible. Otherwise, only the hidden layer itself is ignored.",
          where: "SettingsSectionSync.svelte · Hidden layers (i)",
        },
      ],
    },
    {
      title: "Connect & exact match",
      items: [
        {
          text: "Exact match / Other suggestions",
          where: "Connect.svelte · result group headers (exact match shown first)",
        },
        {
          text: "Auto-connect by exact match",
          where: "Index.svelte · bulk action (auto-links unconnected strings to exactly-matching Tolgee keys)",
        },
        {
          text: "Matching {done}/{total}… (Cancel) → preview: To connect ({n}) · Skipped ({n}) → Cancel / Connect ({n})",
          where: "Index.svelte · exact-match dialog (progress→preview; nothing applied until Connect)",
        },
        {
          text: "(i) No exact match in Tolgee — create the key or connect it manually. / Several keys match this text exactly — open Connect to pick one.",
          where: "Index.svelte · exact-match dialog · per-skipped (i) tooltip",
        },
      ],
    },
    {
      title: "Placeholders",
      items: [
        {
          text: "Search by string (key)…",
          where: "Index.svelte (search), Connect.svelte (key search)",
        },
        { text: "Key name", where: "Index.svelte (bulk), NodeListItem.svelte (inline key input), StringDetails.svelte (editable Key field, ns shown as read-only prefix)" },
        { text: "https://app.tolgee.io / tgpak_...", where: "SettingsSectionConnection.svelte" },
        { text: "{artboard}.{elementName}", where: "SettingsSectionKeys.svelte · key-format input" },
        { text: "tag-one, tag-two", where: "SettingsSectionPush.svelte · tags" },
        { text: "Translation…", where: "StringDetails.svelte (IcuEditor), PluralEditor.svelte (per-variant chip field)" },
        { text: "#1 / #10 (chip for ICU # count, shows the form's example value)", where: "PluralVariantInput.svelte · inside each plural-variant field" },
        { text: "example", where: "ParamsEditor.svelte · per-parameter value" },
      ],
    },
    {
      title: "Notable buttons & flow labels",
      items: [
        { text: "Upload → Tolgee / Download → Figma", where: "SyncButton.svelte · Index footer" },
        {
          text: "Choose operation… / Connect to key / Connect by exact match / Edit key name / Generate key names ({n}) / Set namespace ({n}) / Disconnect connected keys ({n}) / Clear key name ({n})",
          where: "Index.svelte · bulk action bar",
        },
        {
          text: "String details / Move to string / Connection detail / Copy key / Copy string / Open in Tolgee",
          where: "NodeListItem.svelte · ⋮ menu (last three are Dev Mode-only, the deleted minipanel's replacements)",
        },
        { text: "Revert string in design", where: "StringDetails.svelte · advanced-format warning" },
        { text: "Upload to Tolgee / Apply resolutions / Try again", where: "Push.svelte" },
        { text: "Apply ({n}) / Try again", where: "Pull.svelte" },
        { text: "Open Settings", where: "Index.svelte · unauthenticated CTA" },
        { text: "Connect / Disconnect", where: "Connect.svelte, SettingsSectionConnection.svelte" },
      ],
    },
    {
      title: "Toasts (figma.notify)",
      note: "send({ type: \"notify\" }) — a native Figma toast on the CANVAS, not inside the plugin panel. Distinct from the Messages & banners group above, which are in-panel components.",
      items: [
        { text: "Key copied", where: "NodeListItem.svelte · Dev Mode ⋮ menu, Copy key (+ trigger icon flashes to a checkmark in-panel)" },
        { text: "String copied", where: "NodeListItem.svelte · Dev Mode ⋮ menu, Copy string (+ trigger icon flashes to a checkmark in-panel)" },
        { text: "Some strings failed to update.", where: "App.svelte · a bulk pluginData write partially failed (nodes-set-result ok:false)" },
        { text: "Not available in Dev Mode", where: "bus.ts · a canvas-mutating action (apply-translations, create-copy) was attempted in Dev Mode and blocked" },
        { text: "No changes found.", where: "CopyView.svelte · Download, nothing changed (keys-mode toast; language-mode shows the same text as a persisted banner instead — see \"Copy page\" below)" },
        { text: "Downloaded {n} string(s) to Figma.", where: "CopyView.svelte · language-mode Download success" },
        { text: "Copy recreated.", where: "CopyView.svelte · after \"Recreate copy\" succeeds (keys-mode)" },
        { text: "Downloaded {n} translation(s) for {language}.", where: "Pull.svelte · apply success" },
        { text: "Uploaded {n} key(s) to Tolgee", where: "Push.svelte · done stage (also shown as a persisted Message — see Messages & banners)" },
        { text: "Created keys page.", where: "CreateCopy.svelte · keys-mode submit success" },
        { text: "Created {n} language page(s).", where: "CreateCopy.svelte · languages-mode submit success" },
      ],
    },
    {
      title: "Dialogs & confirmations",
      items: [
        {
          text: "Unsaved changes — You have unsaved changes for \"{label}\". Save them? (Save / Discard)",
          where: "StringDetails.svelte · selection switches to another node mid-edit (replaces a confirm() that's a silent no-op in Figma's sandboxed iframe — Esc/overlay resolves as Save, never a silent Discard)",
        },
      ],
    },
    {
      title: "Copy page (CopyView.svelte)",
      note: "The page a language- or keys-mode copy renders to. Same file for both modes — differs by whether `language` is set.",
      items: [
        { text: "{pageName} (copy)", where: "header title" },
        { text: "Shows Tolgee keys. Doesn't sync back.", where: "\"About this page\" (i), keys-mode only" },
        { text: "Download / Download all / Scanning…", where: "header action button on LANGUAGE copies — label depends on hasUserSelection / a page-wide scan in flight; hidden entirely in Dev Mode" },
        { text: "Recreate copy", where: "staleness banner button on any copy, AND the permanent header action on KEYS copies (nothing to download there — labels refresh only by recreating). Both need a recorded sourcePageId and hide in Dev Mode (banner text itself is in Messages & banners)" },
        { text: "Loading translations from Tolgee / Scanning page for connected keys… / Applying translations / Recreating copy…", where: "ProgressBar labels for the four in-flight stages" },
        { text: "Downloaded {n} strings.", where: "persisted success Message after a language-mode Download (distinct from the toast of the same shape — see Toasts)" },
        { text: "Timed out waiting for the translations to apply. / Timed out waiting for the copy to be recreated.", where: "idle-timeout errors (apply-translations / create-copy watchdogs)" },
        { text: "Failed to apply translations to one or more nodes. / Failed to recreate the copy.", where: "fallback errors with no specific server message" },
        { text: "Select a string or frame", where: "EmptyState, Dev Mode + language-mode, nothing selected (no download instruction — the action doesn't exist there)" },
        { text: "Download strings to Figma. — All, or just the selected frames.", where: "EmptyState, language-mode (non-Dev), nothing selected" },
        { text: "Select a string or frame — Shows its key below.", where: "EmptyState, keys-mode, nothing selected" },
        { text: "(empty)", where: "list row fallback when a node's characters is blank" },
        { text: "Not connected", where: "list row, unconnected node shown in place of its key" },
      ],
    },
    {
      title: "Create copy (CreateCopy.svelte)",
      items: [
        { text: "Create copy", where: "ViewHeader title" },
        { text: "Mode — Create page with key names / Create page per language", where: "mode radio group" },
        { text: "Languages", where: "Card label, languages-mode only" },
        { text: "Loading languages… / No languages available.", where: "languages list, while fetching / fetched empty" },
        { text: "{lang.name} ({lang.tag})", where: "per-language CheckboxField label" },
        { text: "Loading translations from Tolgee…", where: "ProgressBar label, fetching stage" },
        { text: "Creating copy…", where: "ProgressBar label, creating stage" },
        { text: "Timed out waiting for the copy to be created.", where: "idle-timeout error inside dispatchCreate()" },
        { text: "Unknown error", where: "fallback when create-copy-result fails without a specific error string" },
        { text: "Create", where: "ViewFooter primary confirm button, disabled until a valid mode/selection is set" },
      ],
    },
  ];

  // Live filter across copy text + location, so a specific string is findable
  // instead of eyeballing the whole wall.
  let q = $state("");
  const total = groups.reduce((n, g) => n + g.items.length, 0);
  const filtered = $derived(
    groups
      .map((g) => ({
        ...g,
        items: g.items.filter((it) => {
          if (!q) return true;
          const needle = q.toLowerCase();
          return (
            it.text.toLowerCase().includes(needle) ||
            it.where.toLowerCase().includes(needle)
          );
        }),
      }))
      .filter((g) => g.items.length > 0),
  );
  const shown = $derived(filtered.reduce((n, g) => n + g.items.length, 0));

  // The `where` strings read "File.svelte · location detail" — split so the
  // file shows as a chip and the detail as muted text on its own line.
  function splitWhere(where: string): { file: string; detail: string } {
    const i = where.indexOf(" · ");
    if (i === -1) return { file: where, detail: "" };
    return { file: where.slice(0, i), detail: where.slice(i + 3) };
  }
</script>

<!-- Renders a catalogue entry as the REAL inline status block so its colour +
     icon are visible (incl. correct light/dark theming). -->
{#snippet messagePreview(item: Entry)}
  <Message
    variant={item.variant ?? "info"}
    icon={item.icon === "info" ? Info : undefined}
  >
    {item.text}
  </Message>
{/snippet}

<div class="space-y-5">
  <div class="space-y-2">
    <p class="text-xs text-text-secondary">
      All user-facing copy (messages, tooltips, empty states, hints,
      placeholders, notable buttons) and where each appears. Dynamic parts shown
      as <code>{"{placeholder}"}</code>.
    </p>
    <input
      type="search"
      bind:value={q}
      placeholder="Filter copy or location…"
      class="h-8 w-full max-w-sm rounded-md border border-border bg-bg px-2.5 text-xs text-text transition-colors placeholder:text-text-secondary/60 hover:border-text/30 focus:border-border-brand focus:outline-none"
    />
    <p class="text-[11px] text-text-secondary">
      {shown} of {total} entries{q ? ` matching “${q}”` : ""}
    </p>
  </div>

  {#each filtered as group (group.title)}
    <section>
      <h2
        class="sticky top-0 z-10 mb-2 flex items-baseline gap-2 border-b border-border bg-bg/95 py-1.5 backdrop-blur"
      >
        <span class="text-sm font-semibold text-primary">{group.title}</span>
        <span
          class="rounded-full bg-bg-secondary px-1.5 text-[10px] text-text-secondary"
        >
          {group.items.length}
        </span>
      </h2>
      {#if group.note}
        <p class="mb-2 text-[11px] italic text-text-secondary">{group.note}</p>
      {/if}
      <ul class="space-y-0.5">
        {#each group.items as item (item.text)}
          {@const w = splitWhere(item.where)}
          <li class="rounded-md px-2 py-1.5 hover:bg-bg-secondary">
            {#if group.render === "message"}
              {@render messagePreview(item)}
            {:else}
              <p class="text-sm leading-snug text-text">{item.text}</p>
            {/if}
            <p
              class="mt-1 flex flex-wrap items-center gap-1.5 text-[10px] text-text-secondary"
            >
              <span
                class="shrink-0 rounded border border-border bg-bg px-1.5 py-0.5 font-mono"
              >
                {w.file}
              </span>
              {#if w.detail}<span class="leading-snug">{w.detail}</span>{/if}
            </p>
          </li>
        {/each}
      </ul>
    </section>
  {/each}

  {#if filtered.length === 0}
    <p class="py-6 text-center text-xs text-text-secondary">
      No copy matches “{q}”.
    </p>
  {/if}
</div>
