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

    cy.frameLoaded("#plugin_iframe");
    cy.iframe().findDcy("index_language_select").select("de");

    cy.iframe().contains("This action will replace translations in 1 nodes");
    cy.iframe().findDcy("pull_submit_button").should("exist").click();
  });
});
