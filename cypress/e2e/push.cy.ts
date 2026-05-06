import { createTestNode, SIGNED_IN } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Push", () => {
  it("shows differences correctly", () => {
    const nodes = [
      createTestNode({ text: "New key", key: "new_key" }),
      createTestNode({ text: "Changed key", key: "on-the-road-subtitle" }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");

    cy.iframe().contains("New key").should("exist");

    cy.iframe().findDcy("index_push_button").should("be.visible").click();

    cy.iframe().contains("New keys").should("exist");

    cy.iframe()
      .findDcy("changes_new_keys")
      .contains("new_key")
      .should("be.visible");

    cy.iframe()
      .findDcy("changes_changed_keys")
      .contains("on-the-road-subtitle")
      .should("be.visible");
  });

  it("catches conflicts", () => {
    const nodes = [
      createTestNode({ text: "First value", key: "new_key" }),
      createTestNode({ text: "Second value", key: "new_key" }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");

    cy.iframe().contains("First value").should("exist");

    cy.iframe().findDcy("index_push_button").should("be.visible").click();

    cy.iframe()
      .contains("There are multiple different translations for single key")
      .should("exist");
  });

  it("pushes screenshot correctly", () => {
    const nodes = [
      createTestNode({ text: "On the road", key: "on-the-road-title" }),
    ];
    visitWithState({
      config: { ...SIGNED_IN, updateScreenshots: true },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");

    cy.iframe().contains("On the road").should("exist");
    cy.iframe().findDcy("index_push_button").should("be.visible").click();

    cy.iframe().contains("No changes necessary").should("be.visible");
    cy.iframe().findDcy("push_upload_screenshots_checkbox").should("exist");
    cy.iframe().findDcy("push_submit_button").should("be.visible").click();

    cy.iframe()
      .contains("Successfully updated 0 key(s) and uploaded 1 screenshot(s).")
      .should("be.visible");
    cy.iframe().findDcy("push_ok_button").should("be.visible").click();
  });

  it("shows correct key count in success message after pushing new keys", () => {
    const nodes = [
      createTestNode({ text: "New key 1", key: "new_key_1" }),
      createTestNode({ text: "New key 2", key: "new_key_2" }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");

    cy.iframe().contains("New key 1").should("exist");
    cy.iframe().findDcy("index_push_button").should("be.visible").click();

    // Verify we see the new keys in the diff
    cy.iframe().contains("New keys").should("exist");
    cy.iframe()
      .findDcy("changes_new_keys")
      .contains("new_key_1")
      .should("be.visible");
    cy.iframe()
      .findDcy("changes_new_keys")
      .contains("new_key_2")
      .should("be.visible");

    // Push the changes
    cy.iframe().findDcy("push_submit_button").should("be.visible").click();

    // Verify success message shows correct count (2 keys)
    cy.iframe().contains("Successfully updated 2 key(s)").should("be.visible");
    cy.iframe().findDcy("push_ok_button").should("be.visible").click();
  });

  it("shows correct key count in success message after pushing changed keys", () => {
    const nodes = [
      createTestNode({ text: "Changed text 1", key: "on-the-road-subtitle" }),
      createTestNode({ text: "Changed text 2", key: "on-the-road-title" }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");

    cy.iframe().contains("Changed text 1").should("exist");
    cy.iframe().findDcy("index_push_button").should("be.visible").click();

    // Verify we see the changed keys in the diff
    cy.iframe().contains("Changed keys").should("exist");
    cy.iframe()
      .findDcy("changes_changed_keys")
      .contains("on-the-road-subtitle")
      .should("be.visible");
    cy.iframe()
      .findDcy("changes_changed_keys")
      .contains("on-the-road-title")
      .should("be.visible");

    // Push the changes
    cy.iframe().findDcy("push_submit_button").should("be.visible").click();

    // Verify success message shows correct count (2 keys)
    cy.iframe().contains("Successfully updated 2 key(s)").should("be.visible");
    cy.iframe().findDcy("push_ok_button").should("be.visible").click();
  });

  it("deduplicates screenshot entries when a key has multiple nodes in a frame", () => {
    // Two unconnected text nodes that share the same key+characters end up in
    // the same frame screenshot's `keys` list. The push payload must list
    // that screenshot only once for the key (with both positions), not once
    // per node — otherwise the API receives duplicate KeyScreenshotDto
    // objects with the same uploadedImageId.
    // Unique key per run so this test stays idempotent against the docker
    // server state that survives across cypress runs.
    const dedupKey = `dedup_save_${Date.now()}`;
    const nodes = [
      createTestNode({ text: "Save", key: dedupKey }),
      createTestNode({ text: "Save", key: dedupKey }),
    ];
    visitWithState({
      config: { ...SIGNED_IN, updateScreenshots: true },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.intercept("POST", "**/v2/projects/single-step-import-resolvable").as(
      "pushKeys",
    );

    cy.iframe().findDcy("index_push_button").should("be.visible").click();
    // Wait for the diff view to actually render before reaching for the
    // submit button — without this Cypress can latch onto a stale iframe
    // body and the visibility check throws getBoundingClientRect.
    cy.iframe().contains("New keys").should("be.visible");
    cy.iframe().findDcy("push_submit_button").should("be.visible").click();

    cy.wait("@pushKeys").then((interception) => {
      const body = interception.request.body as {
        keys: Array<{
          name: string;
          screenshots: Array<{
            uploadedImageId: number;
            positions: Array<{ x: number; y: number }>;
          }>;
        }>;
      };
      const target = body.keys.find((k) => k.name === dedupKey);
      expect(target, "key in payload").to.exist;
      // Single screenshot reference for the key, not one per node.
      expect(target!.screenshots).to.have.length(1);
      // Both node positions are reported under that single screenshot.
      expect(target!.screenshots[0].positions).to.have.length(2);
    });

    cy.iframe().contains("Successfully updated").should("be.visible");
  });

  it("shows no changes when re-opening Push immediately after a successful push", () => {
    // Regression test for the race where the fire-and-forget connectNodes
    // mutation hadn't completed by the time the user navigated back into
    // Push, so the next Push view recomputed the diff against stale local
    // node data and re-displayed the just-pushed changes.
    const uniqueKey = `race_${Date.now()}`;
    const nodes = [createTestNode({ text: "Hello race", key: uniqueKey })];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    // First push: shows the new key as a change.
    cy.iframe().findDcy("index_push_button").should("be.visible").click();
    // Wait for the diff view before reaching for the contained key.
    cy.iframe().contains("New keys").should("be.visible");
    cy.iframe()
      .findDcy("changes_new_keys")
      .contains(uniqueKey)
      .should("be.visible");
    cy.iframe().findDcy("push_submit_button").should("be.visible").click();

    cy.iframe().contains("Successfully updated 1 key(s)").should("be.visible");
    cy.iframe().findDcy("push_ok_button").should("be.visible").click();

    // Back at Index, push again right away — should be a no-op now.
    cy.iframe().contains("Hello race").should("be.visible");
    cy.iframe().findDcy("index_push_button").should("be.visible").click();
    cy.iframe().contains("No changes necessary").should("be.visible");
  });

  it("doesn't push screenshot when disabled", () => {
    const nodes = [
      createTestNode({ text: "Changed text 2", key: "on-the-road-title" }),
    ];
    visitWithState({
      config: { ...SIGNED_IN, updateScreenshots: false },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");

    cy.iframe().contains("Changed text 2").should("exist");
    cy.iframe().findDcy("index_push_button").should("be.visible").click();

    cy.iframe().contains("No changes necessary").should("be.visible");

    cy.iframe().findDcy("push_finish_button").should("be.visible").click();
  });
});
