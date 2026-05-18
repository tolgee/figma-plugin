import { describe, it } from "vitest";

// TODO(phase-10): once Agent S lands `src/ui-inspect/lib/deeplink.ts`,
// flesh out these tests. The intended cases are:
//
//   - buildKeyDeepLink({ apiUrl: "https://app.tolgee.io", projectId: 7 },
//       { key: "x", ns: "y" })
//     → URL with pathname `/projects/7/translations` and
//       search params `search=x&filterNamespace=y`.
//   - Without `projectId`, pathname falls back to `/projects/translations`.
//   - Without `apiUrl`, the function returns null.
//   - A trailing slash on `apiUrl` is stripped before composing the URL.
//
// File does not exist yet (parallel Agent S is creating it); skipping the
// suite to keep CI green until then.
describe.skip("buildKeyDeepLink (pending src/ui-inspect/lib/deeplink.ts)", () => {
  it("placeholder", () => {
    // Intentionally empty — see TODO above.
  });
});
