import { createTestNode } from "@/web/urlConfig";
import { visitWithState, SIGNED_IN } from "../common/tools";

describe("Change language", () => {
  it("replaces text correctly", () => {
    const nodes = [
      createTestNode({
        text: "On the road",
        key: "on-the-road-title",
        connected: true,
      }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");
    cy.iframe().contains("On the road").should("exist");
    cy.iframe().findDcy("index_language_select").select("de");

    cy.iframe().contains("This action will replace translations in 1 nodes");
    cy.iframe().findDcy("pull_submit_button").should("exist").click();

    cy.iframe().contains("Auf dem Weg").should("be.visible");
  });

  it("won't touch nonexistant", () => {
    const nodes = [
      createTestNode({
        text: "On the road",
        key: "on-the-road-title",
        connected: true,
      }),
      createTestNode({
        text: "Connected to nonexistant",
        key: "nonexistant-key",
        connected: true,
      }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.frameLoaded("#plugin_iframe");
    cy.iframe().contains("On the road").should("be.visible");
    cy.iframe().contains("Connected to nonexistant").should("exist");
    cy.iframe().findDcy("index_language_select").select("de");

    cy.iframe()
      .contains("This action will replace translations in 1")
      .should("be.visible");
    cy.iframe().contains("Missing keys").should("be.visible");
    cy.iframe().contains("nonexistant-key").should("be.visible");
    cy.iframe().findDcy("pull_submit_button").should("exist").click();

    cy.iframe().contains("Auf dem Weg").should("be.visible");
    cy.iframe().contains("Connected to nonexistant").should("be.visible");
  });
});
