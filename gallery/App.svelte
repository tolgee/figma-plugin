<script lang="ts">
  import {
    Button,
    Input,
    Label,
    Switch,
    Select,
    Card,
    Dialog,
    Tabs,
    Tooltip,
    DropdownMenu,
    Badge,
    Message,
    EmptyState,
    ProgressBar,
    Checkbox,
    CheckboxField,
    KeyFormatInput,
    TagInput,
    TruncatedText,
    StatusMarker,
    FilterChip,
    Stat,
    IconButton,
    TooltipIconButton,
    SearchInput,
  } from "$ui/lib/components/ui";
  import NamespaceInput from "$ui/lib/components/ui/namespaceInput.svelte";
  import NodeListItem from "$ui/lib/components/domain/NodeListItem.svelte";
  import SyncButton from "$ui/lib/components/domain/SyncButton.svelte";
  import ErrorBanner from "$ui/lib/components/domain/ErrorBanner.svelte";
  import Tolgee from "$ui/lib/components/icons/Tolgee.svelte";
  import Screens from "./Screens.svelte";
  import CopyDoc from "./Copy.svelte";
  import Onboarding from "./Onboarding.svelte";
  import { ICON } from "$shared/iconSizes";
  import { seedMockData, sampleNodes, makeNode } from "./mock";

  // ---- Icons (every lucide icon used across the plugin) -------------------
  import AlertTriangle from "lucide-svelte/icons/alert-triangle";
  import ArrowLeft from "lucide-svelte/icons/arrow-left";
  import ArrowRight from "lucide-svelte/icons/arrow-right";
  import Check from "lucide-svelte/icons/check";
  import CheckCircle2 from "lucide-svelte/icons/check-circle-2";
  import ChevronDown from "lucide-svelte/icons/chevron-down";
  import Copy from "lucide-svelte/icons/copy";
  import EllipsisVertical from "lucide-svelte/icons/ellipsis-vertical";
  import Eraser from "lucide-svelte/icons/eraser";
  import ExternalLink from "lucide-svelte/icons/external-link";
  import Eye from "lucide-svelte/icons/eye";
  import EyeOff from "lucide-svelte/icons/eye-off";
  import Figma from "lucide-svelte/icons/figma";
  import FileText from "lucide-svelte/icons/file-text";
  import Files from "lucide-svelte/icons/files";
  import Group from "lucide-svelte/icons/group";
  import Info from "lucide-svelte/icons/info";
  import KeyRound from "lucide-svelte/icons/key-round";
  import Languages from "lucide-svelte/icons/languages";
  import Link2 from "lucide-svelte/icons/link-2";
  import Link2Off from "lucide-svelte/icons/link-2-off";
  import ListFilter from "lucide-svelte/icons/list-filter";
  import LoaderCircle from "lucide-svelte/icons/loader-circle";
  import Meh from "lucide-svelte/icons/meh";
  import MousePointer from "lucide-svelte/icons/mouse-pointer";
  import Pencil from "lucide-svelte/icons/pencil";
  import Plug from "lucide-svelte/icons/plug";
  import Search from "lucide-svelte/icons/search";
  import SearchX from "lucide-svelte/icons/search-x";
  import SettingsIcon from "lucide-svelte/icons/settings";
  import Tag from "lucide-svelte/icons/tag";
  import Target from "lucide-svelte/icons/target";
  import Wand from "lucide-svelte/icons/wand";
  import X from "lucide-svelte/icons/x";
  // Candidate icons for the two row conflict flags (see "Conflict flag icons").
  import CircleAlert from "lucide-svelte/icons/circle-alert";
  import CopyX from "lucide-svelte/icons/copy-x";
  import FilePenLine from "lucide-svelte/icons/file-pen-line";
  import PenOff from "lucide-svelte/icons/pen-off";
  import History from "lucide-svelte/icons/history";
  import FileClock from "lucide-svelte/icons/file-clock";
  import GitCompareArrows from "lucide-svelte/icons/git-compare-arrows";
  import Diff from "lucide-svelte/icons/diff";
  import OctagonAlert from "lucide-svelte/icons/octagon-alert";

  // The two row conflict flags, with their current icon + colour and the
  // candidate replacements. `current: true` marks what ships today. Same-key
  // candidates are WARNING glyphs, not keys — the row already has a key glyph,
  // so a key here read as visual chaos (user 2026-06).
  const sameKeyIcons = [
    { name: "triangle-alert", comp: AlertTriangle, current: true },
    { name: "circle-alert", comp: CircleAlert },
    { name: "octagon-alert", comp: OctagonAlert },
    { name: "copy-x", comp: CopyX },
  ];
  const manualChangeIcons = [
    { name: "pen-off", comp: PenOff, current: true },
    { name: "file-pen-line", comp: FilePenLine },
    { name: "circle-alert", comp: CircleAlert },
    { name: "history", comp: History },
    { name: "file-clock", comp: FileClock },
    { name: "git-compare-arrows", comp: GitCompareArrows },
    { name: "diff", comp: Diff },
  ];

  // Icon sizes actually used in the codebase, smallest → largest.
  const iconSizes = [10, 11, 12, 14, 28];

  const icons = [
    { name: "alert-triangle", comp: AlertTriangle },
    { name: "arrow-left", comp: ArrowLeft },
    { name: "arrow-right", comp: ArrowRight },
    { name: "check", comp: Check },
    { name: "check-circle-2", comp: CheckCircle2 },
    { name: "chevron-down", comp: ChevronDown },
    { name: "copy", comp: Copy },
    { name: "ellipsis-vertical", comp: EllipsisVertical },
    { name: "eraser", comp: Eraser },
    { name: "external-link", comp: ExternalLink },
    { name: "eye", comp: Eye },
    { name: "eye-off", comp: EyeOff },
    { name: "figma", comp: Figma },
    { name: "file-text", comp: FileText },
    { name: "files", comp: Files },
    { name: "group", comp: Group },
    { name: "info", comp: Info },
    { name: "key-round", comp: KeyRound },
    { name: "languages", comp: Languages },
    { name: "link-2", comp: Link2 },
    { name: "link-2-off", comp: Link2Off },
    { name: "list-filter", comp: ListFilter },
    { name: "loader-circle", comp: LoaderCircle },
    { name: "meh", comp: Meh },
    { name: "mouse-pointer", comp: MousePointer },
    { name: "pencil", comp: Pencil },
    { name: "plug", comp: Plug },
    { name: "search", comp: Search },
    { name: "search-x", comp: SearchX },
    { name: "settings", comp: SettingsIcon },
    { name: "tag", comp: Tag },
    { name: "target", comp: Target },
    { name: "wand", comp: Wand },
    { name: "x", comp: X },
  ];

  // Icon colours (the `class` prop). All theme-aware (light/dark). `icon-muted`
  // is a DS token (--sem-icon-muted) that is FULLY OPAQUE — used for large
  // decorative / empty-state glyphs where Figma's translucent icon colours
  // would double-paint overlapping strokes.
  const iconColors = [
    { cls: "text-icon", note: "default" },
    { cls: "text-icon-secondary", note: "secondary · translucent" },
    { cls: "text-text-brand", note: "brand · hover/active" },
    { cls: "text-icon-muted", note: "empty states · opaque" },
  ];

  // ---- Typography (sizes / weights / styles actually used) ----------------
  // `count` = occurrences in src, surfaced so we can see what's load-bearing.
  const fontSizes = [
    { cls: "text-[10px]", px: "10px", count: 30 },
    { cls: "text-[11px]", px: "11px", count: 14 },
    { cls: "text-xs", px: "12px", count: 53 },
    { cls: "text-sm", px: "14px", count: 15 },
    { cls: "text-base", px: "16px", count: 4 },
    { cls: "text-lg", px: "18px", count: 3 },
  ];
  const fontWeights = [
    { cls: "font-normal", label: "normal", weight: "400", count: 2 },
    { cls: "font-medium", label: "medium", weight: "500", count: 7 },
    { cls: "font-semibold", label: "semibold", weight: "600", count: 26 },
    { cls: "font-bold", label: "bold", weight: "700", count: 1 },
  ];
  const fontStyles = [
    { cls: "italic", label: "italic", count: 16 },
    { cls: "uppercase tracking-wide", label: "uppercase + tracking-wide", count: 12 },
    { cls: "tracking-tight", label: "tracking-tight", count: 2 },
    { cls: "font-mono", label: "font-mono", count: 6 },
  ];

  // Seed stores up-front so the domain components below (which read the auth /
  // app stores) render with realistic data regardless of which tab opens first.
  seedMockData();

  // ---- Top-level view + theme --------------------------------------------
  let view = $state<"screens" | "components" | "texts" | "onboarding">("screens");
  let dark = $state(false);
  $effect(() => {
    document.documentElement.classList.toggle("figma-dark", dark);
  });

  // ---- Interactive demo state --------------------------------------------
  // Proposed icon sizes to tune against text. Defaults bumped up from the
  // current 11–14px so icons read bigger but still pair with the small UI text.
  let inlineIcon = $state(16); // sits next to body text (11–12px)
  let actionIcon = $state(20); // standalone buttons / header actions
  let inputValue = $state("Hello world");
  let switchOn = $state(true);
  let selectValue = $state("camelCase");
  let cbA = $state(true);
  let cbB = $state(true);
  let cbC = $state(false);
  let kfValue = $state("{frame}.{elementName}");
  let progressDemo = $state(80);
  let searchInputValue = $state("");
  let namespaceValue = $state("common");
  const sampleNamespaces = ["common", "home", "legal"];
  let dropdownLastAction = $state("(none yet)");
  // Copy-feedback demo (mirrors NodeListItem's dev-mode ⋮ trigger flash):
  // clicking Copy key / Copy string flashes the trigger to a checkmark
  // for 1.2s, then it reverts. Same `justCopied` + $effect logic as the real
  // component so the gallery shows the ACTION, not just the static icon.
  let copyDemoFlash = $state(false);
  let copyDemoLast = $state("(nothing copied yet)");
  $effect(() => {
    if (!copyDemoFlash) return;
    const t = setTimeout(() => (copyDemoFlash = false), 1200);
    return () => clearTimeout(t);
  });
  function copyDemo(what: string): void {
    copyDemoLast = what;
    copyDemoFlash = true;
  }
  let tagsValue = $state(["mobile"]);
  const sampleProjectTags = [
    "mobile",
    "web",
    "marketing",
    "v2",
    "draft",
    "legal",
  ];
  async function demoSuggestTags(q: string): Promise<string[]> {
    const s = q.trim().toLowerCase();
    return s
      ? sampleProjectTags.filter((t) => t.includes(s))
      : sampleProjectTags;
  }

  const buttonVariants = [
    "default",
    "secondary",
    "ghost",
    "destructive",
    "outline",
  ] as const;
  const buttonSizes = ["sm", "md", "lg"] as const;

  const selectOptions = [
    { value: "camelCase", label: "camelCase" },
    { value: "snake_case", label: "snake_case" },
    { value: "kebab-case", label: "kebab-case" },
    { value: "PascalCase", label: "PascalCase" },
  ];

  const tokens = [
    { name: "bg", varName: "--color-bg" },
    { name: "bg-secondary", varName: "--color-bg-secondary" },
    { name: "bg-brand", varName: "--color-bg-brand" },
    { name: "bg-selected", varName: "--color-bg-selected" },
    { name: "text", varName: "--color-text" },
    { name: "text-secondary", varName: "--color-text-secondary" },
    { name: "text-brand", varName: "--color-text-brand" },
    { name: "border", varName: "--color-border" },
    { name: "border-brand", varName: "--color-border-brand" },
    { name: "icon", varName: "--color-icon" },
  ];

  // Semantic palette — each colour has main / dark / light shades, all
  // theme-aware (the swatches switch with the Dark mode toggle).
  const palette = [
    { key: "primary", label: "Primary" },
    { key: "secondary", label: "Secondary" },
    { key: "success", label: "Success" },
    { key: "error", label: "Error" },
    { key: "info", label: "Info" },
  ];
  const shades = [
    { suffix: "", label: "main" },
    { suffix: "-dark", label: "dark" },
    { suffix: "-light", label: "light" },
  ];

  // Isolated NodeListItem states (the card from the screenshot's list).
  const nliUnconnected = makeNode({
    id: "demo-unconnected",
    name: "Greeting",
    characters: "Hello, Alex",
    key: "home.intro",
    connected: false,
  });
  const nliConnected = makeNode({
    id: "demo-connected",
    name: "CTA",
    characters: "Get started",
    key: "home.cta",
    ns: "common",
    connected: true,
  });
  const nliEmpty = makeNode({
    id: "demo-empty",
    name: "Empty",
    characters: "",
    key: "",
    connected: false,
  });
</script>

{#snippet section(title: string, children: import("svelte").Snippet)}
  <section class="mb-8">
    <h2 class="text-sm font-semibold text-text mb-3 pb-1 border-b border-border">
      {title}
    </h2>
    {@render children()}
  </section>
{/snippet}

<div class="min-h-screen bg-bg text-text">
  <!-- Sticky header -->
  <header
    class="sticky top-0 z-20 flex items-center justify-between px-6 py-3 border-b border-border bg-bg/95 backdrop-blur"
  >
    <div class="flex items-center gap-3">
      <span class="text-sm font-semibold">Tolgee Plugin — Design System</span>
      <div class="flex items-center gap-1">
        <button
          type="button"
          onclick={() => (view = "screens")}
          class="h-6 rounded px-2 text-xs transition-colors"
          class:bg-bg-secondary={view === "screens"}
          class:text-text={view === "screens"}
          class:text-text-secondary={view !== "screens"}
        >
          Screens
        </button>
        <button
          type="button"
          onclick={() => (view = "components")}
          class="h-6 rounded px-2 text-xs transition-colors"
          class:bg-bg-secondary={view === "components"}
          class:text-text={view === "components"}
          class:text-text-secondary={view !== "components"}
        >
          Components
        </button>
        <button
          type="button"
          onclick={() => (view = "texts")}
          class="h-6 rounded px-2 text-xs transition-colors"
          class:bg-bg-secondary={view === "texts"}
          class:text-text={view === "texts"}
          class:text-text-secondary={view !== "texts"}
        >
          Texts
        </button>
        <button
          type="button"
          onclick={() => (view = "onboarding")}
          class="h-6 rounded px-2 text-xs transition-colors"
          class:bg-bg-secondary={view === "onboarding"}
          class:text-text={view === "onboarding"}
          class:text-text-secondary={view !== "onboarding"}
        >
          Onboarding
        </button>
      </div>
    </div>
    <label class="flex items-center gap-2 text-xs text-text-secondary">
      Dark mode
      <Switch bind:checked={dark} />
    </label>
  </header>

  <main class="max-w-4xl mx-auto px-6 py-6">
    {#if view === "screens"}
      <Screens />
    {:else if view === "texts"}
      <CopyDoc />
    {:else if view === "onboarding"}
      <Onboarding />
    {:else}
      <!-- ============ COMPONENTS ============ -->

      <!-- NodeListItem (the list card from the screenshot) -->
      {#snippet nliBody()}
        <Tooltip.Provider delayDuration={300}>
          <div class="flex flex-wrap gap-6">
            <div class="w-[300px]">
              <p class="mb-1 text-[11px] text-text-secondary">Unconnected (editable key)</p>
              <ul><NodeListItem node={nliUnconnected} /></ul>
            </div>
            <div class="w-[300px]">
              <p class="mb-1 text-[11px] text-text-secondary">Connected (key + text in brand colour)</p>
              <ul><NodeListItem node={nliConnected} /></ul>
            </div>
            <div class="w-[300px]">
              <p class="mb-1 text-[11px] text-text-secondary">Empty text</p>
              <ul><NodeListItem node={nliEmpty} /></ul>
            </div>
            <div class="w-[300px]">
              <p class="mb-1 text-[11px] text-text-secondary">
                Duplicate (same text N× in selection — click to filter)
              </p>
              <ul>
                <NodeListItem
                  node={nliUnconnected}
                  duplicateCount={3}
                  onSearch={() => {}}
                />
              </ul>
            </div>
          </div>
        </Tooltip.Provider>
        <p class="mt-3 text-[11px] text-text-secondary">
          Text → String details · key → Connection detail · hover the icons for
          tooltips. Connected rows show a disconnect action; the
          <code>⋮</code> menu holds String details / Move to string /
          Connection detail.
        </p>
      {/snippet}
      {@render section("NodeListItem (list card)", nliBody)}

      <!-- Design tokens -->
      {#snippet tokensBody()}
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {#each tokens as t (t.varName)}
            <div class="flex items-center gap-2 border border-border rounded p-2">
              <div
                class="h-8 w-8 shrink-0 rounded border border-border"
                style={`background: var(${t.varName})`}
              ></div>
              <div class="min-w-0">
                <div class="text-xs font-medium truncate">{t.name}</div>
                <div class="text-[10px] text-text-secondary truncate">
                  {t.varName}
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/snippet}
      {@render section("Design tokens", tokensBody)}

      <!-- Semantic colour palette -->
      {#snippet paletteBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Tolgee brand palette — each colour has <code>main</code> /
          <code>dark</code> / <code>light</code>. Utilities:
          <code>bg-primary</code>, <code>text-success</code>,
          <code>border-error-light</code>… Toggle Dark mode to see the dark
          values.
        </p>
        <div class="flex flex-col gap-3">
          {#each palette as c (c.key)}
            <div class="flex flex-wrap items-center gap-2">
              <span class="w-20 shrink-0 text-xs font-medium text-text">
                {c.label}
              </span>
              {#each shades as s (s.suffix)}
                <div
                  class="flex items-center gap-2 rounded border border-border p-1.5"
                >
                  <div
                    class="h-8 w-8 shrink-0 rounded border border-border"
                    style={`background: var(--sem-${c.key}${s.suffix})`}
                  ></div>
                  <div class="min-w-0 pr-1">
                    <div class="text-[11px] font-medium text-text">
                      {s.label}
                    </div>
                    <div class="text-[10px] text-text-secondary">
                      bg-{c.key}{s.suffix}
                    </div>
                  </div>
                </div>
              {/each}
            </div>
          {/each}
        </div>
      {/snippet}
      {@render section("Color palette", paletteBody)}

      <!-- Icons -->
      {#snippet iconsBody()}
        <a
          href="https://lucide.dev/icons/"
          target="_blank"
          rel="noopener noreferrer"
          class="mb-5 inline-flex items-center gap-1.5 rounded border border-border px-3 py-1.5 text-xs text-text transition-colors hover:bg-bg-secondary hover:text-text-brand"
        >
          Browse all icons on lucide.dev
          <ExternalLink size={13} />
        </a>
        <p class="mb-2 text-[11px] text-text-secondary">
          We use <strong class="text-text">lucide</strong> icons. Import path:
          <code>lucide-svelte/icons/&lt;name&gt;</code> (the kebab-case name shown
          on lucide.dev). Props: <code>size</code> (px) + <code>class</code> for
          color.
        </p>
        <p class="mb-2 text-[11px] text-text-secondary">
          Sizes used in the plugin (the <code>size</code> prop, in px):
        </p>
        <div class="mb-5 flex flex-wrap items-end gap-5">
          {#each iconSizes as s (s)}
            <div class="flex flex-col items-center gap-1.5 text-text">
              <div class="flex h-8 items-center text-icon">
                <SettingsIcon size={s} />
              </div>
              <span class="text-[10px] text-text-secondary">{s}px</span>
            </div>
          {/each}
        </div>

        <p class="mb-2 text-[11px] text-text-secondary">
          Icon colours (the <code>class</code> prop) — all theme-aware:
        </p>
        <div class="mb-5 flex flex-wrap gap-4">
          {#each iconColors as ic (ic.cls)}
            <div class="flex w-24 flex-col items-center gap-1.5 text-center">
              <div
                class={`flex h-10 w-10 items-center justify-center rounded border border-border ${ic.cls}`}
              >
                <Meh size={24} />
              </div>
              <code class="text-[10px] text-text">{ic.cls}</code>
              <span class="text-[10px] text-text-secondary">{ic.note}</span>
            </div>
          {/each}
        </div>

        <p class="mb-2 text-[11px] text-text-secondary">
          All {icons.length} icons in use (rendered at 16px,
          <code>text-icon</code>):
        </p>
        <div class="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
          {#each icons as icon (icon.name)}
            {@const Icon = icon.comp}
            <div
              class="flex flex-col items-center gap-1.5 rounded border border-border p-2 text-center"
            >
              <div class="text-icon"><Icon size={16} /></div>
              <span class="w-full truncate text-[10px] text-text-secondary">
                {icon.name}
              </span>
            </div>
          {/each}
        </div>
      {/snippet}
      {@render section("Icons", iconsBody)}

      <!-- Icon sizing with text -->
      {#snippet iconSizingBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Tune icon sizes against real text. Rule of thumb: an inline icon reads
          balanced at <strong class="text-text">font-size + 2–4px</strong>.
        </p>

        <!-- Controls -->
        <div class="mb-5 flex flex-wrap gap-6 text-xs text-text-secondary">
          <label class="flex items-center gap-2">
            Inline icon
            <input type="range" min="11" max="24" bind:value={inlineIcon} />
            <span class="w-9 tabular-nums text-text">{inlineIcon}px</span>
          </label>
          <label class="flex items-center gap-2">
            Action icon
            <input type="range" min="14" max="28" bind:value={actionIcon} />
            <span class="w-9 tabular-nums text-text">{actionIcon}px</span>
          </label>
        </div>

        <!-- Inline pairings: icon next to each body text size -->
        <p class="mb-2 text-xs font-semibold text-text">
          Inline with text ({inlineIcon}px icon)
        </p>
        <div class="mb-5 flex flex-col gap-2.5">
          {#each [{ cls: "text-[11px]", px: 11 }, { cls: "text-xs", px: 12 }, { cls: "text-sm", px: 14 }] as t (t.cls)}
            <div class="flex items-center gap-4 border-b border-border pb-2.5">
              <span class="w-16 shrink-0 text-[10px] text-text-secondary">
                {t.px}px text
              </span>
              <span class={`inline-flex items-center gap-1.5 text-text ${t.cls}`}>
                <SettingsIcon size={inlineIcon} />
                Settings
              </span>
              <span class={`inline-flex items-center gap-1.5 text-text ${t.cls}`}>
                <Link2 size={inlineIcon} />
                Connect key
              </span>
              <span class="text-[10px] text-text-secondary">
                ratio {(inlineIcon / t.px).toFixed(2)}×
              </span>
            </div>
          {/each}
        </div>

        <!-- Buttons + standalone actions -->
        <p class="mb-2 text-xs font-semibold text-text">
          Buttons &amp; actions ({actionIcon}px icon)
        </p>
        <div class="flex flex-wrap items-center gap-3">
          <Button>
            <Search size={actionIcon} /> Search
          </Button>
          <Button variant="secondary">
            <Files size={actionIcon} /> Copy
          </Button>
          <Button variant="ghost" size="sm" aria-label="Settings">
            <SettingsIcon size={actionIcon} />
          </Button>
          <Button variant="outline">
            <Check size={actionIcon} /> Done
          </Button>
        </div>
      {/snippet}
      {@render section("Icon sizing (with text)", iconSizingBody)}

      <!-- Typography -->
      {#snippet typographyBody()}
        <p class="mb-4 text-[11px] text-text-secondary">
          Base font: <strong class="text-text">Inter</strong>, body
          <code>11px</code> / line-height <code>1.4</code> (set in
          <code>styles.css</code>). Counts = occurrences in <code>src</code>.
        </p>

        <p class="mb-2 text-xs font-semibold text-text">Sizes</p>
        <div class="mb-5 flex flex-col gap-2">
          {#each fontSizes as fs (fs.cls)}
            <div class="flex items-baseline gap-3 border-b border-border pb-2">
              <code class="w-24 shrink-0 text-[10px] text-text-secondary">
                {fs.cls}
              </code>
              <span class="w-10 shrink-0 text-[10px] text-text-secondary">
                {fs.px}
              </span>
              <span class="w-10 shrink-0 text-[10px] text-text-secondary">
                ×{fs.count}
              </span>
              <span class={`flex-1 truncate text-text ${fs.cls}`}>
                The quick brown fox
              </span>
            </div>
          {/each}
        </div>

        <p class="mb-2 text-xs font-semibold text-text">Weights</p>
        <div class="mb-5 flex flex-col gap-2">
          {#each fontWeights as fw (fw.cls)}
            <div class="flex items-baseline gap-3 border-b border-border pb-2">
              <code class="w-24 shrink-0 text-[10px] text-text-secondary">
                {fw.cls}
              </code>
              <span class="w-10 shrink-0 text-[10px] text-text-secondary">
                {fw.weight}
              </span>
              <span class="w-10 shrink-0 text-[10px] text-text-secondary">
                ×{fw.count}
              </span>
              <span class={`flex-1 text-sm text-text ${fw.cls}`}>
                The quick brown fox
              </span>
            </div>
          {/each}
        </div>

        <p class="mb-2 text-xs font-semibold text-text">Styles</p>
        <div class="flex flex-col gap-2">
          {#each fontStyles as st (st.cls)}
            <div class="flex items-baseline gap-3 border-b border-border pb-2">
              <code class="w-44 shrink-0 text-[10px] text-text-secondary">
                {st.cls}
              </code>
              <span class="w-10 shrink-0 text-[10px] text-text-secondary">
                ×{st.count}
              </span>
              <span class={`flex-1 text-xs text-text ${st.cls}`}>
                The quick brown fox
              </span>
            </div>
          {/each}
        </div>
      {/snippet}
      {@render section("Typography", typographyBody)}

      <!-- Links -->
      {#snippet linksBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Default = <strong class="text-text">no underline</strong>. On
          <strong class="text-text">hover they underline only</strong> (colour
          stays). Two colours: secondary (default) and brand (Tolgee-related).
          Hover them to see it.
        </p>
        <div class="flex flex-col items-start gap-2 text-xs">
          <button type="button" class="text-text-secondary hover:underline">
            Secondary link (e.g. a layer's text)
          </button>
          <button
            type="button"
            class="font-semibold text-text-brand hover:underline"
          >
            Brand link (e.g. a connected key, project name)
          </button>
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          <code
            class="block rounded bg-bg-secondary p-2 text-[10px] leading-relaxed"
          >
            text-text-secondary hover:underline<br
            />text-text-brand hover:underline
          </code>
        </p>
      {/snippet}
      {@render section("Links", linksBody)}

      <!-- Buttons -->
      {#snippet buttonsBody()}
        <div class="space-y-3">
          {#each buttonSizes as size (size)}
            <div class="flex flex-wrap items-center gap-2">
              <span class="w-8 text-[10px] text-text-secondary">{size}</span>
              {#each buttonVariants as variant (variant)}
                <Button {variant} {size}>{variant}</Button>
              {/each}
            </div>
          {/each}
          <div class="flex flex-wrap items-center gap-2 pt-1">
            <span class="w-8 text-[10px] text-text-secondary">off</span>
            {#each buttonVariants as variant (variant)}
              <Button {variant} disabled>{variant}</Button>
            {/each}
          </div>
        </div>
      {/snippet}
      {@render section("Buttons", buttonsBody)}

      <!-- Sync buttons (Upload / Download) -->
      {#snippet syncButtonsBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          The canonical data-transfer actions. Always use
          <code>SyncButton</code> for these — never hand-roll the label/icon
          combo. The arrow points at the destination's brand mark, so direction
          + target read at a glance.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <SyncButton direction="upload" />
          <SyncButton direction="download" />
        </div>
        <div class="mt-2 flex flex-wrap items-center gap-2">
          <SyncButton direction="upload" disabled />
          <SyncButton direction="download" disabled />
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage:
          <code>&lt;SyncButton direction="upload" onclick={"{...}"} /&gt;</code>
          — <code>upload</code> = primary → Tolgee, <code>download</code> =
          secondary → Figma.
        </p>
      {/snippet}
      {@render section("Sync buttons (Upload / Download)", syncButtonsBody)}

      <!-- Icon button -->
      {#snippet iconButtonBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Square icon-only action button — one canonical hover (subtle
          background + icon turning brand-pink) so every icon action matches.
          Forwards native button props, so it also works as a Tooltip/
          DropdownMenu trigger child. Used across <code>ViewHeader</code>,
          <code>Header</code> and <code>NodeListItem</code>'s row actions.
        </p>
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex flex-col items-center gap-1.5">
            <IconButton size="sm" aria-label="Edit">
              <Pencil size={ICON.inline} />
            </IconButton>
            <span class="text-[10px] text-text-secondary">sm</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <IconButton size="md" aria-label="Settings">
              <SettingsIcon size={ICON.action} />
            </IconButton>
            <span class="text-[10px] text-text-secondary">md</span>
          </div>
          <div class="flex flex-col items-center gap-1.5">
            <IconButton size="sm" aria-label="Disabled" disabled>
              <Pencil size={ICON.inline} />
            </IconButton>
            <span class="text-[10px] text-text-secondary">disabled</span>
          </div>
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;IconButton size="sm|md" aria-label&gt;&lt;Icon /&gt;&lt;/IconButton&gt;</code>
        </p>
      {/snippet}
      {@render section("Icon button", iconButtonBody)}

      <!-- Tooltip icon button -->
      {#snippet tooltipIconButtonBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          The canonical "icon action with a tooltip": collapses the repeated
          <code>Tooltip.Root</code> → <code>Trigger</code> →
          <code>IconButton</code> → <code>Tooltip.Content</code> boilerplate
          into one element. <code>label</code> doubles as the
          <code>aria-label</code> and the tooltip text unless
          <code>tooltip</code> overrides it. Must sit inside a
          <code>Tooltip.Provider</code> (list/view components already wrap
          one). Used for connect/disconnect in <code>NodeListItem</code> and
          the back button in <code>ViewHeader</code>.
        </p>
        <Tooltip.Provider delayDuration={300}>
          <div class="flex flex-wrap items-center gap-4">
            <TooltipIconButton label="Connect to key">
              <Link2 size={ICON.inline} />
            </TooltipIconButton>
            <TooltipIconButton label="Disconnect" tooltip="Disconnect from key">
              <Link2Off size={ICON.inline} />
            </TooltipIconButton>
            <TooltipIconButton label="Cancel" side="top">
              <X size={ICON.inline} />
            </TooltipIconButton>
          </div>
        </Tooltip.Provider>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;TooltipIconButton label tooltip? side? onclick&gt;&lt;Icon /&gt;&lt;/TooltipIconButton&gt;</code>
          — hover the buttons above to see it.
        </p>
      {/snippet}
      {@render section("Tooltip icon button", tooltipIconButtonBody)}

      <!-- Inputs & labels -->
      {#snippet inputsBody()}
        <div class="space-y-3 max-w-xs">
          <div class="flex flex-col gap-1">
            <Label for="demo-input">Key name</Label>
            <Input id="demo-input" bind:value={inputValue} />
          </div>
          <div class="flex flex-col gap-1">
            <Label for="demo-ph">With placeholder</Label>
            <Input id="demo-ph" placeholder="Search keys…" />
          </div>
          <div class="flex flex-col gap-1">
            <Label for="demo-dis">Disabled</Label>
            <Input id="demo-dis" value="Can't edit" disabled />
          </div>
          <p class="text-xs text-text-secondary">value: {inputValue}</p>
        </div>
      {/snippet}
      {@render section("Inputs & Labels", inputsBody)}

      <!-- Select -->
      {#snippet selectBody()}
        <div class="space-y-2 max-w-xs">
          <Select
            bind:value={selectValue}
            options={selectOptions}
            onChange={(v) => (selectValue = v)}
          />
          <Select options={selectOptions} placeholder="Disabled select" disabled />
          <p class="text-xs text-text-secondary">selected: {selectValue}</p>
        </div>
      {/snippet}
      {@render section("Select", selectBody)}

      <!-- Search input -->
      {#snippet searchInputBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Search field used across the plugin: a magnifying-glass on the left
          and, once there's a value, a clear "✕" on the right that empties the
          box. Wraps the base <code>Input</code> so the icon padding and clear
          behaviour live in one place. Used for the Connect screen's key
          search and the Index list filter.
        </p>
        <div class="max-w-xs">
          <SearchInput bind:value={searchInputValue} placeholder="Search keys…" />
        </div>
        <p class="mt-2 text-[11px] text-text-secondary">
          Value: <code>{searchInputValue || "(empty)"}</code>
        </p>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;SearchInput bind:value placeholder? /&gt;</code>
        </p>
      {/snippet}
      {@render section("Search input", searchInputBody)}

      <!-- Namespace input -->
      {#snippet namespaceInputBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Single-value namespace combobox: pick an existing namespace or type
          a NEW one (created on push). Mirrors <code>TagInput</code>'s look/
          behaviour; "" is the "&lt;none&gt;" (default) namespace. Used in
          <code>NodeListItem</code>'s inline namespace field and Settings →
          project namespace.
        </p>
        <div class="max-w-xs">
          <NamespaceInput
            value={namespaceValue}
            onChange={(v) => (namespaceValue = v)}
            options={sampleNamespaces}
          />
        </div>
        <p class="mt-2 text-[11px] text-text-secondary">
          Value: <code>{namespaceValue || "<none>"}</code>
        </p>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;NamespaceInput value onChange options? placeholder? /&gt;</code>
        </p>
      {/snippet}
      {@render section("Namespace input (autocomplete)", namespaceInputBody)}

      <!-- Switch -->
      {#snippet switchBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Not yet used anywhere in the product — kept as a reserved
          primitive. Its only current instance is this gallery's own
          dark-mode toggle (meta-UI, not a product screen).
        </p>
        <div class="flex items-center gap-6">
          <label class="flex items-center gap-2 text-xs">
            <Switch bind:checked={switchOn} />
            {switchOn ? "On" : "Off"}
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary">
            <Switch checked disabled />
            Disabled (on)
          </label>
          <label class="flex items-center gap-2 text-xs text-text-secondary">
            <Switch disabled />
            Disabled (off)
          </label>
        </div>
      {/snippet}
      {@render section("Switch", switchBody)}

      <!-- Checkbox -->
      {#snippet checkboxBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          <strong class="text-text">16×16px</strong> box, same
          <code>border-border</code> + <code>bg-bg</code> as
          <code>Input</code> (so fields and checkboxes match). Presentational —
          wrap it in a button or menu item for interactivity;
          <code>indeterminate</code> renders the "some selected" bar for master
          checkboxes.
        </p>
        <div class="flex flex-wrap items-center gap-6">
          <span class="flex items-center gap-2 text-xs text-text">
            <Checkbox /> unchecked
          </span>
          <span class="flex items-center gap-2 text-xs text-text">
            <Checkbox checked /> checked
          </span>
          <span class="flex items-center gap-2 text-xs text-text">
            <Checkbox indeterminate /> indeterminate
          </span>
        </div>
      {/snippet}
      {@render section("Checkbox", checkboxBody)}

      <!-- Checkbox field -->
      {#snippet checkboxFieldBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          A labelled checkbox ROW: left checkbox + label, clickable as one. The
          OFF state stays clearly visible (vs a right-side switch). Optional
          <code>trailing</code> snippet renders after the label OUTSIDE the
          toggle (for an inline input, an (i) hint, …). Used across Settings →
          Strings and Keys.
        </p>
        <div class="max-w-xs space-y-2 rounded-md border border-border p-3">
          <CheckboxField
            label="Numbers"
            checked={cbA}
            onChange={(v) => (cbA = v)}
          >
            {#snippet trailing()}
              <Info size={ICON.inline} class="text-text-secondary" />
            {/snippet}
          </CheckboxField>
          <CheckboxField
            label="Hidden layers"
            checked={cbB}
            onChange={(v) => (cbB = v)}
          />
          <CheckboxField
            class="pl-6"
            label="Including all child texts"
            checked={cbC}
            onChange={(v) => (cbC = v)}
          />
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          <code
            >&lt;CheckboxField label checked onChange
            {"{#snippet trailing()}…{/snippet}"} /&gt;</code
          >
        </p>
      {/snippet}
      {@render section("Checkbox field", checkboxFieldBody)}

      <!-- Key format input -->
      {#snippet keyFormatBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Token field for building a key format: placeholders render as inline
          chips, free text stays editable. Type to open the autocomplete —
          anchored to the CARET (flips above when there's no room below), filter
          by what you type, Enter / click inserts a chip. Serializes to/from the
          <code>{"{placeholder}"}</code> string. Used in Settings → Key format and
          the bulk "Generate key names" action.
        </p>
        <div class="max-w-sm">
          <KeyFormatInput
            value={kfValue}
            onChange={(v) => (kfValue = v)}
            placeholder={"{artboard}.{elementName}"}
          />
        </div>
        <p class="mt-2 text-[11px] text-text-secondary">
          Value: <code>{kfValue || "(empty)"}</code>
        </p>
        <p class="mt-3 text-[11px] text-text-secondary">
          <code>&lt;KeyFormatInput value onChange onSubmit? placeholder? /&gt;</code>
        </p>
      {/snippet}
      {@render section("Key format input (autocomplete)", keyFormatBody)}

      <!-- Tag input -->
      {#snippet tagInputBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Tag multi-select: selected tags are removable chips, the input
          autocompletes the project's existing tags and offers to CREATE a new
          one when what you type isn't there (new tags are created on push).
          Dropdown is field-anchored (flips above when needed). Used in Settings
          → Add tags.
        </p>
        <div class="max-w-sm">
          <TagInput
            value={tagsValue}
            onChange={(t) => (tagsValue = t)}
            fetchSuggestions={demoSuggestTags}
          />
        </div>
        <p class="mt-2 text-[11px] text-text-secondary">
          Value: <code>{tagsValue.join(", ") || "(none)"}</code>
        </p>
        <p class="mt-3 text-[11px] text-text-secondary">
          <code>&lt;TagInput value onChange fetchSuggestions? /&gt;</code>
        </p>
      {/snippet}
      {@render section("Tag input (autocomplete)", tagInputBody)}

      <!-- Truncated text -->
      {#snippet truncBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          The DS truncation pattern: one-line text that ellipsizes when it
          overflows, with a tooltip showing the FULL text on hover — but only
          when it's actually clipped. Pass <code>onclick</code> to render it as a
          link. Put it in a <code>min-w-0</code> flex parent. Used for the Settings
          project link.
        </p>
        <div class="max-w-[14rem] space-y-2 rounded-md border border-border p-3">
          <TruncatedText text="Short name (no tooltip)" />
          <TruncatedText
            text="A very long project name that does not fit in this box"
          />
          <TruncatedText
            text="Open this long project link that truncates too"
            onclick={() => {}}
            class="font-semibold text-secondary-dark underline underline-offset-2"
          />
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          <code>&lt;TruncatedText text onclick? side? /&gt;</code>
        </p>
      {/snippet}
      {@render section("Truncated text (+ tooltip)", truncBody)}

      <!-- Card -->
      {#snippet cardBody()}
        <Card class="max-w-sm">
          <div class="flex flex-col gap-1">
            <span class="text-sm font-medium">Card title</span>
            <span class="text-xs text-text-secondary">
              Cards group related content with a subtle border and padding.
            </span>
          </div>
        </Card>
      {/snippet}
      {@render section("Card", cardBody)}

      <!-- Badges -->
      {#snippet badgesBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Tiny status pills (plural, duplicate count, …) — neutral = muted grey
          (<code>text-text-secondary</code>), 10px, outlined. The base pill for
          <code>FilterChip</code> too, so every pill matches in size + colour.
        </p>
        <div class="flex flex-wrap items-center gap-2">
          <Badge>Plural</Badge>
          <Badge class="gap-0.5"><Copy size={ICON.badge} />2</Badge>
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;Badge&gt;plural&lt;/Badge&gt;</code>
        </p>
      {/snippet}
      {@render section("Badges", badgesBody)}

      <!-- Conflict flag icons -->
      {#snippet conflictIconsBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          The two in-list conflict flags — both plain red {ICON.marker}px icons
          (<code>text-error</code>, <code>ICON.marker</code>), no badge/count, to
          keep the row uncluttered. The <strong>current</strong> shipping icon is
          outlined.
        </p>

        <!-- Same key, different text — plain red marker (16px) -->
        <p class="mb-2 text-xs font-semibold text-text">
          Same key · different text
          <span class="font-normal text-text-secondary"
            >— one key, two diverging strings; only one uploads</span
          >
        </p>
        <div class="mb-4 flex flex-wrap gap-2">
          {#each sameKeyIcons as ic (ic.name)}
            <div
              class="flex w-28 flex-col items-center gap-1.5 rounded border px-2 py-2.5 {ic.current
                ? 'border-border-brand'
                : 'border-border'}"
            >
              <span class="text-error"><ic.comp size={ICON.marker} /></span>
              <code class="text-[10px] text-text-secondary">{ic.name}</code>
              {#if ic.current}
                <span class="text-[9px] uppercase tracking-wide text-text-brand"
                  >current</span
                >
              {/if}
            </div>
          {/each}
        </div>

        <!-- Manual change -->
        <p class="mb-2 text-xs font-semibold text-text">
          Manual change
          <span class="font-normal text-text-secondary"
            >— Figma text edited directly, diverged from the saved translation</span
          >
        </p>
        <div class="mb-4 flex flex-wrap gap-2">
          {#each manualChangeIcons as ic (ic.name)}
            <div
              class="flex w-24 flex-col items-center gap-1.5 rounded border px-2 py-2.5 {ic.current
                ? 'border-border-brand'
                : 'border-border'}"
            >
              <span class="text-error"><ic.comp size={ICON.marker} /></span>
              <code class="text-[10px] text-text-secondary">{ic.name}</code>
              {#if ic.current}
                <span class="text-[9px] uppercase tracking-wide text-text-brand"
                  >current</span
                >
              {/if}
            </div>
          {/each}
        </div>

        <!-- In-context: the two shipping flags, rendered with the real
             `StatusMarker` DS component (one source for colour/size/hover). -->
        <p class="mb-2 text-[11px] text-text-secondary">In a row (real <code>StatusMarker</code> — hover to see the unified affordance):</p>
        <Tooltip.Provider delayDuration={300}>
          <div class="max-w-sm divide-y divide-dashed divide-border rounded border border-border">
            <div class="flex items-center gap-1.5 px-3 py-2 text-xs">
              <span class="min-w-0 flex-1 truncate text-text">Submit</span>
              <StatusMarker label="Same key, different text — click to filter">
                <AlertTriangle size={ICON.marker} />
              </StatusMarker>
              <code class="text-[10px] text-text-secondary">same key</code>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-2 text-xs">
              <span class="min-w-0 flex-1 truncate text-text">Welcome back</span>
              <StatusMarker label="Manual changes detected — open String details">
                <PenOff size={ICON.marker} />
              </StatusMarker>
              <code class="text-[10px] text-text-secondary">manual change</code>
            </div>
          </div>
        </Tooltip.Provider>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage:
          <code>&lt;StatusMarker label onclick&gt;&lt;Icon/&gt;&lt;/StatusMarker&gt;</code>
          — red, <code>ICON.marker</code>, unified <code>hover:opacity-70</code>.
        </p>
      {/snippet}
      {@render section("Conflict flag icons", conflictIconsBody)}

      <!-- Stat (summary numbers) -->
      {#snippet statBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          A summary statistic: a prominent number (<code>text-lg</code>) above a
          12px label, one component so every stat matches. <code>tone</code>
          colours the value. Used for the Push New / Changed / Unchanged
          breakdown.
        </p>
        <Card class="border-0 bg-bg-secondary">
          <div class="grid grid-cols-3 gap-2">
            <Stat value={8} label="New" tone="secondary" />
            <Stat value={6} label="Changed" tone="brand" />
            <Stat value={42} label="Unchanged" tone="muted" />
          </div>
        </Card>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage:
          <code>&lt;Stat value label tone="brand|secondary|muted" /&gt;</code>
        </p>
      {/snippet}
      {@render section("Stat (summary numbers)", statBody)}

      <!-- Progress bar -->
      {#snippet progressBarBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Thin (<code>h-[5px]</code>), fully rounded bar in the brand colour —
          the single canonical progress bar for the whole plugin (Index
          bulk-write progress, Push diff-computation + screenshot/upload
          progress, Pull page-scan/download/apply progress, and CreateCopy's
          fetch stage). Two modes: DETERMINATE when <code>total</code> is a
          known positive number (real percentage fill), and INDETERMINATE
          when <code>total</code> is <code>null</code> (or <code>0</code>) — a
          ~40%-wide bar slides across instead of an empty/fake fill. This
          replaces the old <code>PullProgress</code>/<code>PushProgress</code>
          domain components, which each had their own near-duplicate
          indeterminate CSS.
        </p>
        <div class="max-w-sm space-y-4">
          <div>
            <p class="mb-1 text-[10px] text-text-secondary">No label (Index write progress)</p>
            <ProgressBar loaded={progressDemo} total={100} />
          </div>
          <div>
            <p class="mb-1 text-[10px] text-text-secondary">With label (Push diff progress)</p>
            <ProgressBar loaded={progressDemo} total={100} label="Computing changes…" />
          </div>
          <div>
            <p class="mb-1 text-[10px] text-text-secondary">
              Indeterminate (unknown total — page scan / fetch not started yet)
            </p>
            <ProgressBar loaded={0} total={null} label="Scanning page for connected keys…" />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            bind:value={progressDemo}
            class="w-full"
          />
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;ProgressBar loaded total label? /&gt;</code>
        </p>
      {/snippet}
      {@render section("Progress bar", progressBarBody)}

      <!-- Filter chips -->
      {#snippet filterChipsBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Removable "active filter" pills shown above the list. <strong
            >It IS a neutral <code>Badge</code></strong
          > (same 10px / muted colour / border / radius as the plural + duplicate
          badges) + a trailing ✕. One row holds every active view filter (the
          exact-key filter from a conflict click, exact-text from a duplicate
          badge, "hide connected", …) so each can be cleared individually.
        </p>
        <div class="flex flex-wrap items-center gap-1.5">
          <FilterChip onclear={() => {}}>generatedkey.my_test</FilterChip>
          <FilterChip onclear={() => {}}>"Submit"</FilterChip>
          <FilterChip onclear={() => {}}>hide connected</FilterChip>
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;FilterChip onclear&gt;label&lt;/FilterChip&gt;</code>
        </p>
      {/snippet}
      {@render section("Filter chips", filterChipsBody)}

      <!-- Messages -->
      {#snippet messagesBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Inline status messages in the semantic palette (error / warning /
          success / info). Icon + colour come from the variant; the tint is
          mixed from the same colour, so they adapt to dark mode.
        </p>
        <div class="flex max-w-md flex-col gap-2">
          <Message variant="error">
            Invalid API key. Please check your project API key.
          </Message>
          <Message variant="warning">
            2 key(s) reuse the same name with different text in Figma.
          </Message>
          <Message variant="success">
            <strong class="font-semibold">My Project</strong> was successfully connected.
          </Message>
          <Message variant="secondary">
            <strong class="font-semibold">My Project</strong> was successfully connected.
            <span class="text-text-secondary"> (teal "connected" state)</span>
          </Message>
          <Message variant="info">
            Translations rarely change during a session — they're cached for 30s.
          </Message>
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;Message variant="error"&gt;…&lt;/Message&gt;</code>
        </p>
      {/snippet}
      {@render section("Messages", messagesBody)}

      <!-- Error banner -->
      {#snippet errorBannerBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          App-shell-level banner rendered above every route in
          <code>src/ui/App.svelte</code> whenever
          <code>appState.value.errorBanner</code> is set — unlike
          <code>Message</code> (which a route places inline), this sits at the
          very top of the plugin regardless of which screen is open. Two
          severities, both plain (no icon): <code>error</code> (red) and
          <code>warning</code> (yellow). The gallery's <code>Screens</code>
          tab renders routes directly and skips the <code>App.svelte</code>
          shell, so this never otherwise appears here — shown below on mock
          data.
        </p>
        <div class="max-w-md space-y-2">
          <ErrorBanner
            banner={{ message: "Invalid API key. Please check your project API key.", severity: "error" }}
          />
          <ErrorBanner
            banner={{ message: "This project's branching feature is disabled — branch changes will be ignored.", severity: "warning" }}
          />
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage: <code>&lt;ErrorBanner banner={"{{ message, severity: \"error\"|\"warning\" }}"} /&gt;</code>
        </p>
      {/snippet}
      {@render section("Error banner", errorBannerBody)}

      <!-- Empty states -->
      {#snippet emptyStatesBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          One <code>EmptyState</code> pattern everywhere: a muted, opaque icon
          (<code>text-icon-muted</code>) centred both axes on the available area,
          a title, and an optional description. Fills its container
          (<code>flex-1</code>), so it sits in the vertical centre — never
          pinned to the top.
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div class="flex h-44 flex-col rounded border border-border">
            <EmptyState
              icon={Group}
              title="Select strings for translation"
              description="(texts, frames...)"
            />
          </div>
          <div class="flex h-44 flex-col rounded border border-border">
            <EmptyState icon={Meh} title="Nothing to translate here" />
          </div>
          <div class="flex h-44 flex-col rounded border border-border">
            <EmptyState
              icon={SearchX}
              title="No strings match your search"
              description="Try another word."
            />
          </div>
          <div class="flex h-44 flex-col rounded border border-border">
            <EmptyState
              icon={Tolgee}
              title="No matching key in Tolgee"
              description="Searched key names and source text. Try another word."
            />
          </div>
        </div>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage:
          <code>
            &lt;EmptyState icon={"{Meh}"} title="…" description="…" /&gt;
          </code>
          — <code>icon</code> is any component with the <code>size</code> +
          <code>class</code> API (lucide icon or the Tolgee mark).
        </p>
      {/snippet}
      {@render section("Empty states", emptyStatesBody)}

      <!-- Counts -->
      {#snippet countsBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Two count formats, kept visually distinct so they never read as the
          same thing.
        </p>
        <div class="flex flex-col gap-3">
          <div class="flex items-baseline gap-3">
            <span class="w-16 shrink-0 text-xs text-text-secondary">5 strings</span>
            <span class="text-[11px] text-text-secondary">
              <strong class="text-text">Results count</strong> — always the
              number of items currently shown (after search/filter). The plain
              "<code>N strings</code>" form, never "5 of 7".
            </span>
          </div>
          <div class="flex items-baseline gap-3">
            <span class="w-16 shrink-0 text-xs text-text-secondary">1/7</span>
            <span class="text-[11px] text-text-secondary">
              <strong class="text-text">Selection count</strong> — selected /
              total (<code>N/M</code>), used ONLY in the bulk action bar. The
              slash is reserved for this so it can't be confused with the
              results count.
            </span>
          </div>
        </div>
      {/snippet}
      {@render section("Counts", countsBody)}

      <!-- Tabs -->
      {#snippet tabsBody()}
        <Tabs.Root value="push">
          <Tabs.List>
            <Tabs.Trigger value="push">Push</Tabs.Trigger>
            <Tabs.Trigger value="pull">Pull</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="push">
            <p class="text-xs text-text-secondary">Push tab content.</p>
          </Tabs.Content>
          <Tabs.Content value="pull">
            <p class="text-xs text-text-secondary">Pull tab content.</p>
          </Tabs.Content>
          <Tabs.Content value="settings">
            <p class="text-xs text-text-secondary">Settings tab content.</p>
          </Tabs.Content>
        </Tabs.Root>
      {/snippet}
      {@render section("Tabs", tabsBody)}

      <!-- Dialog -->
      {#snippet dialogBody()}
        <Dialog.Root>
          <Dialog.Trigger>
            {#snippet child({ props })}
              <Button {...props}>Open dialog</Button>
            {/snippet}
          </Dialog.Trigger>
          <Dialog.Content>
            <div class="flex flex-col gap-3">
              <Dialog.Title>Confirm push</Dialog.Title>
              <Dialog.Description>
                This will push your changes to the connected Tolgee project.
              </Dialog.Description>
              <div class="flex justify-end gap-2">
                <Dialog.Close>
                  {#snippet child({ props })}
                    <Button variant="ghost" {...props}>Cancel</Button>
                  {/snippet}
                </Dialog.Close>
                <Dialog.Close>
                  {#snippet child({ props })}
                    <Button {...props}>Push</Button>
                  {/snippet}
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Root>
      {/snippet}
      {@render section("Dialog", dialogBody)}

      <!-- Tooltip -->
      {#snippet tooltipBody()}
        <Tooltip.Provider>
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button variant="outline" {...props}>Hover me</Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>This is a tooltip</Tooltip.Content>
          </Tooltip.Root>
        </Tooltip.Provider>
      {/snippet}
      {@render section("Tooltip", tooltipBody)}

      <!-- Dropdown menu -->
      {#snippet dropdownMenuBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          The overflow ("⋮") menu — <code>Root</code> / <code>Trigger</code> /
          <code>Content</code> / <code>Item</code> / <code>Separator</code>,
          wrapping <code>bits-ui</code>'s primitive with the plugin's
          colours/spacing. The trigger is usually an <code>IconButton</code>
          via the <code>{"{#snippet child({ props })}"}</code> pattern (so
          the button forwards ARIA/open-state props). Used for
          <code>NodeListItem</code>'s row overflow menu.
        </p>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <IconButton {...props} aria-label="More actions">
                <EllipsisVertical size={ICON.inline} />
              </IconButton>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            <DropdownMenu.Item onSelect={() => (dropdownLastAction = "String details")}>
              <FileText size={ICON.inline} /> String details
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => (dropdownLastAction = "Move to string")}>
              <Target size={ICON.inline} /> Move to string
            </DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item onSelect={() => (dropdownLastAction = "Connection detail")}>
              <Link2 size={ICON.inline} /> Connection detail
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <p class="mt-3 text-[11px] text-text-secondary">
          Last selected: <code>{dropdownLastAction}</code>
        </p>
        <p class="mt-3 text-[11px] text-text-secondary">
          Usage:
          <code
            >&lt;DropdownMenu.Root&gt;&lt;DropdownMenu.Trigger&gt;…&lt;/DropdownMenu.Trigger&gt;&lt;DropdownMenu.Content&gt;&lt;DropdownMenu.Item
            onSelect&gt;…&lt;/DropdownMenu.Item&gt;&lt;/DropdownMenu.Content&gt;&lt;/DropdownMenu.Root&gt;</code
          >
        </p>
      {/snippet}
      {@render section("Dropdown menu", dropdownMenuBody)}

      <!-- Copy feedback (Dev Mode) -->
      {#snippet copyFeedbackBody()}
        <p class="mb-3 text-[11px] text-text-secondary">
          Dev Mode's <code>NodeListItem</code> ⋮ menu adds <code>Copy key</code>
          and <code>Copy string</code>. Because the <code>notify()</code>
          toast lands on the Figma canvas (not the panel), the row's ⋮ trigger
          also flashes to a green checkmark for 1.2s as an in-panel
          confirmation, then reverts. Open the menu and pick an item to see it.
        </p>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <IconButton {...props} aria-label="More actions">
                {#if copyDemoFlash}
                  <Check size={ICON.inline} class="text-success" />
                {:else}
                  <EllipsisVertical size={ICON.inline} />
                {/if}
              </IconButton>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="start">
            <DropdownMenu.Item onSelect={() => copyDemo("Key copied")}>
              <Copy size={ICON.inline} /> Copy key
            </DropdownMenu.Item>
            <DropdownMenu.Item onSelect={() => copyDemo("String copied")}>
              <Copy size={ICON.inline} /> Copy string
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <p class="mt-3 text-[11px] text-text-secondary">
          Last toast: <code>{copyDemoLast}</code>
        </p>
      {/snippet}
      {@render section("Copy feedback (Dev Mode)", copyFeedbackBody)}
    {/if}
  </main>
</div>
