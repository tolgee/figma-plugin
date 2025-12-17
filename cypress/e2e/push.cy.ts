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
