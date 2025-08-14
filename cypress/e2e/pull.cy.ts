import { createTestNode, SIGNED_IN } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Pull", () => {
  it("everything up to date", () => {
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

    cy.iframeBody().contains("On the road").should("exist");
    cy.iframeBody().findDcy("index_pull_button").click();

    cy.iframeBody().contains("Everything up to date").should("be.visible");
    cy.iframeBody().findDcy("pull_ok_button").should("be.visible").click();
  });

  it("pulling change", () => {
    const nodes = [
      createTestNode({
        text: "On the old road",
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

    cy.iframeBody().contains("On the old road").should("exist");
    cy.iframeBody().findDcy("index_pull_button").click();

    cy.iframeBody()
      .contains("This action will replace translations in 1")
      .should("be.visible");
    cy.iframeBody().contains("Missing keys").should("be.visible");

    cy.iframeBody().contains("nonexistant-key").should("be.visible");

    cy.iframeBody().findDcy("pull_submit_button").should("be.visible").click();

    cy.iframeBody().contains("On the road").should("exist");
    cy.iframeBody().contains("Connected to nonexistant").should("exist");
  });
});
