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
      config: SIGNED_IN,
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
      .contains("Successfully updated 0 keys and uploaded 1 screenshots.")
      .should("be.visible");
    cy.iframe().findDcy("push_ok_button").should("be.visible").click();
  });
});
