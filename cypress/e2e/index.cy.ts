import { createTestNode, SIGNED_IN } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Index", () => {
  it("shows unconnected node correctly", () => {
    const nodes = [createTestNode({ text: "Test node", key: "test_key" })];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframe().contains("Test node").should("be.visible");

    cy.iframe()
      .findDcy("general_node_list_row_text")
      .contains("Test node")
      .should("be.visible");

    cy.iframe()
      .findDcy("general_node_list_row_key")
      .find("input")
      .should("have.value", "test_key");

    cy.iframe()
      .findDcy("general_namespace_select_input")
      .should(($input) => {
        expect($input.val() || "").to.be.empty;
      });
  });

  it("shows connected node correctly", () => {
    const nodes = [
      createTestNode({ text: "Test node", key: "test_key", connected: true }),
    ];
    visitWithState({
      config: SIGNED_IN,
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframe().contains("Test node").should("be.visible");

    cy.iframe()
      .findDcy("general_node_list_row_text")
      .contains("Test node")
      .should("be.visible");

    cy.iframe()
      .findDcy("general_node_list_row_key")
      .contains("test_key")
      .should("be.visible");

    cy.iframe().findDcy("general_node_list_row_namespace").should("be.empty");
  });

  it("shows connected node with namespace", () => {
    const nodes = [
      createTestNode({
        text: "Test node",
        key: "test_key",
        ns: "test_ns",
        connected: true,
      }),
    ];
    visitWithState({
      config: { ...SIGNED_IN },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframe().contains("Test node").should("be.visible");

    cy.iframe()
      .findDcy("general_node_list_row_text")
      .contains("Test node")
      .should("be.visible");

    cy.iframe()
      .findDcy("general_node_list_row_key")
      .contains("test_key")
      .should("be.visible");

    cy.iframe()
      .findDcy("general_node_list_row_namespace")
      .contains("test_ns")
      .should("be.visible");
  });
});
