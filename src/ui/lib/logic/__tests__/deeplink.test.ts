import { describe, expect, it } from "vitest";
import type { NodeInfo } from "$shared/types";
import { buildKeyDeepLink, buildProjectDashboardLink } from "../deeplink";

// Real tests for the module moved out of the deleted ui-inspect minipanel
// (task 22b) — replacing the skipped placeholder that shipped with it. The
// cases below are exactly what that placeholder promised to cover.

function node(overrides: Partial<NodeInfo> = {}): NodeInfo {
  return {
    id: "1:1",
    name: "Layer",
    characters: "Hello",
    translation: "Hello",
    isPlural: false,
    key: "home.title",
    ns: undefined,
    connected: true,
    ...overrides,
  };
}

describe("buildKeyDeepLink", () => {
  it("builds a project-scoped translations search URL (happy path)", () => {
    const url = buildKeyDeepLink({ apiUrl: "https://app.tolgee.io", projectId: 42 }, node());
    expect(url).toBe("https://app.tolgee.io/projects/42/translations?search=home.title");
  });

  it("adds the namespace filter when the node has one", () => {
    const url = buildKeyDeepLink(
      { apiUrl: "https://app.tolgee.io", projectId: 42 },
      node({ ns: "web" }),
    );
    expect(url).toBe(
      "https://app.tolgee.io/projects/42/translations?search=home.title&filterNamespace=web",
    );
  });

  it("falls back to the project-selector view when no projectId is persisted", () => {
    const url = buildKeyDeepLink({ apiUrl: "https://app.tolgee.io" }, node());
    expect(url).toBe("https://app.tolgee.io/projects/translations?search=home.title");
  });

  it("trims trailing slashes off apiUrl instead of producing //", () => {
    const url = buildKeyDeepLink({ apiUrl: "https://app.tolgee.io///", projectId: 1 }, node());
    expect(url).toBe("https://app.tolgee.io/projects/1/translations?search=home.title");
  });

  it("returns null without an apiUrl or without a key", () => {
    expect(buildKeyDeepLink(null, node())).toBeNull();
    expect(buildKeyDeepLink({}, node())).toBeNull();
    expect(buildKeyDeepLink({ apiUrl: "https://app.tolgee.io" }, node({ key: "" }))).toBeNull();
  });

  it("URL-encodes keys with reserved characters", () => {
    const url = buildKeyDeepLink(
      { apiUrl: "https://app.tolgee.io", projectId: 1 },
      node({ key: "a b&c" }),
    );
    expect(url).toBe("https://app.tolgee.io/projects/1/translations?search=a+b%26c");
  });
});

describe("buildProjectDashboardLink", () => {
  it("targets the project dashboard when projectId is known", () => {
    expect(buildProjectDashboardLink({ apiUrl: "https://app.tolgee.io", projectId: 7 })).toBe(
      "https://app.tolgee.io/projects/7",
    );
  });

  it("falls back to the project list without a projectId", () => {
    expect(buildProjectDashboardLink({ apiUrl: "https://app.tolgee.io/" })).toBe(
      "https://app.tolgee.io/projects",
    );
  });

  it("returns null without an apiUrl", () => {
    expect(buildProjectDashboardLink(null)).toBeNull();
    expect(buildProjectDashboardLink({})).toBeNull();
  });
});
