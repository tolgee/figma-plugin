import { createTestNode } from "@/web/urlConfig";
import { visitWithState, SIGNED_IN } from "../common/tools";

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
    cy.iframe().findDcy("index_push_button").should("be.visible").click();
    cy.iframe().contains("New keys").should("be.visible");

    cy.iframe()
      .findDcy("changes_new_keys")
      .contains("new_key")
      .should("be.visible");

    cy.iframe()
      .findDcy("changes_changed_keys")
      .contains("on-the-road-subtitle")
      .should("be.visible");
  });
});
