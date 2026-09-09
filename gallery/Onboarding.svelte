<script lang="ts">
  import { QueryClientProvider } from "@tanstack/svelte-query";
  import { queryClient } from "$ui/lib/stores/query.svelte";
  import { Button } from "$ui/lib/components/ui";
  import { ICON } from "$shared/iconSizes";
  import Settings from "lucide-svelte/icons/settings";
  // The REAL onboarding route — the gallery renders it directly, so there's a
  // single source of truth (no mock stepper to drift from the real one).
  import Onboarding from "$ui/lib/routes/Onboarding.svelte";
  import { seedMockData } from "./mock";

  // Seeds auth (authenticated, project "Figma 2.0", languages) + config, so the
  // real route renders exactly as in the plugin. Because the mock is already
  // authenticated, step 1 shows the "connected" state right away.
  seedMockData();
</script>

<div class="space-y-6">
  <p class="text-xs text-text-secondary">
    First-run setup. <strong class="text-text">Left</strong> is what the current
    flow drops the user into; <strong class="text-text">right</strong> is the
    real <code>Onboarding</code> route — the guided wizard that reuses the
    Settings sections, one step at a time. (The mock here is pre-connected, so
    step 1 shows the connected state.)
  </p>

  <div class="grid gap-6 md:grid-cols-2">
    <!-- ================= LEFT: TODAY (before the wizard) ================= -->
    <section class="space-y-3">
      <div class="flex items-baseline gap-2">
        <h2 class="text-sm font-semibold text-primary">Before</h2>
        <span class="text-[11px] text-text-secondary">the "Sign in" dead-end</span>
      </div>

      <div class="overflow-hidden rounded-lg border border-border bg-bg shadow-sm">
        <header
          class="flex items-center justify-between border-b border-border bg-linear-to-b from-bg to-header-gradient-end px-3 py-2"
        >
          <span class="text-sm font-semibold">Strings</span>
          <Settings size={ICON.action} class="text-text-secondary" />
        </header>
        <div class="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
          <p class="text-sm">Sign in to connect this document with Tolgee.</p>
          <Button>Open Settings</Button>
        </div>
      </div>

      <ol class="list-decimal space-y-1 pl-5 text-[11px] leading-snug text-text-secondary">
        <li>This "Sign in" screen — an extra screen + click before anything.</li>
        <li>Then the full Settings page: three tabs, all at once.</li>
        <li>No sense of progress, no clear "done".</li>
      </ol>
    </section>

    <!-- ================= RIGHT: THE REAL ONBOARDING ROUTE ================= -->
    <section class="space-y-3">
      <div class="flex items-baseline gap-2">
        <h2 class="text-sm font-semibold text-primary">After</h2>
        <span class="text-[11px] text-text-secondary">the real wizard, click through</span>
      </div>

      <div
        class="h-[440px] overflow-hidden rounded-lg border border-border bg-bg shadow-sm"
      >
        <QueryClientProvider client={queryClient}>
          <Onboarding />
        </QueryClientProvider>
      </div>

      <p class="text-[11px] italic leading-snug text-text-secondary">
        Straight into setup on first run (no "Sign in" screen), the same three
        Settings sections one step at a time, Back / Next, ending on the plugin
        ready to use. Reuses the real components — change a section once, it
        updates in Settings and here.
      </p>
    </section>
  </div>
</div>
