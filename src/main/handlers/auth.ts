// API-key validation lives in the design-mode UI bundle (see
// `src/ui/lib/api/auth.ts`) because it depends on `openapi-fetch` and the
// generated OpenAPI types — neither of which we want to drag into the main
// (sandbox) bundle. The UI relays the resolved `projectId` back here via the
// `persist-project-id` message so we can persist it at the document scope and
// the inspect (Dev Mode) UI can build project-aware deep links without doing
// its own API call. See the `on("persist-project-id", ...)` handler in
// `src/main/main.ts`.

// Intentionally no exports: this file documents the design decision above.
export {};
