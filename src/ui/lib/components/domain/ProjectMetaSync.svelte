<script lang="ts">
  import { createQuery } from "@tanstack/svelte-query";
  import { auth } from "$ui/lib/stores/auth.svelte";
  import { getProjectMeta } from "$ui/lib/api/projectMeta";
  import { hydrateBranches } from "$ui/lib/api/pickers";

  /**
   * Keeps the project feature flags (branching / namespaces) fresh for the whole
   * session. `App.maybeBootstrapAuth` reads credentials only once per
   * fingerprint, so without this the flags would go stale — enabling branching
   * in the Tolgee web app wouldn't surface the branch picker until the plugin
   * was reopened.
   *
   * Lives in its own (markup-less) component because `createQuery` needs a
   * QueryClient from context — App.svelte's script runs OUTSIDE its own
   * `<QueryClientProvider>`, so the query is mounted here, as a child of it.
   *
   * svelte-query refetches on window focus and throttles by `staleTime`, so
   * Figma's constant focus churn doesn't spam the endpoint. Only `.data` is
   * read (never the error state), so a transient refetch failure just keeps the
   * last-known flags — no user-facing error.
   */
  const projectMetaQuery = createQuery(() => ({
    queryKey: ["project-meta", auth.value.projectId ?? 0],
    queryFn: () => getProjectMeta(auth.value.apiUrl, auth.value.apiKey, auth.value.projectId!),
    enabled: auth.value.authenticated && auth.value.projectId != null,
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
  }));

  // Non-reactive tracker so the effect hydrates branches ONCE per false→true
  // branching transition (ongoing branch-list freshness is Index's
  // `branchesQuery` job) without re-running from its own store writes.
  let branchingWasEnabled = false;
  $effect(() => {
    const meta = projectMetaQuery.data;
    if (!meta) return;
    auth.setProjectFeatures({
      branchingEnabled: meta.branchingEnabled,
      namespacesEnabled: meta.namespacesFeaturesEnabled,
      projectName: meta.name,
    });
    if (meta.branchingEnabled && !branchingWasEnabled && auth.value.client) {
      void hydrateBranches(auth.value.client);
    }
    branchingWasEnabled = meta.branchingEnabled;
  });
</script>
