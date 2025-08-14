import { createTestNode, SIGNED_IN } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Change language", () => {
  it("switches language", () => {
    const nodes = [
      createTestNode({
        text: "On the road",
        key: "on-the-road-title",
        connected: true,
      }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: [],
      allNodes: nodes,
    });
    cy.iframeBody().within(() => {
      cy.gcy("index_language_select").should("have.value", "en"); // retried
      cy.gcy("index_language_select").select("de");

      cy.get("div")
        .contains("This action will replace translations in 1 text(s)")
        .should("exist");
      cy.gcy("pull_submit_button").should("exist").click();
    });
  });
});
