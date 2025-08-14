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

    cy.iframeBody().findDcy("index_language_select").select("de");

    cy.iframeBody().contains(
      "This action will replace translations in 1 text(s)"
    );
    cy.iframeBody().findDcy("pull_submit_button").should("exist").click();
  });
});
