import { createTestNode, PAGE_COPY, PAGE_COPY_LANGUAGE } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Copy view", () => {
  it("shows keys if language not set", () => {
    visitWithState({
      config: PAGE_COPY,
    });

    cy.iframe().contains("Page copy - keys").should("be.visible");
  });

  it("shows language if language set", () => {
    visitWithState({
      config: PAGE_COPY_LANGUAGE,
    });

    cy.iframe().contains("Page copy - cs").should("be.visible");
  });

  it("shows unconnected node correctly", () => {
    const nodes = [createTestNode({ text: "Test node", key: "test_key" })];
    visitWithState({
      config: PAGE_COPY_LANGUAGE,
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
      .contains("Not connected")
      .should("be.visible");
  });

  it("shows connected node correctly", () => {
    const nodes = [
      createTestNode({
        text: "Test node",
        key: "test_key",
        connected: true,
      }),
    ];
    visitWithState({
      config: PAGE_COPY_LANGUAGE,
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
      config: PAGE_COPY_LANGUAGE,
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

  it("pulls changes correctly", () => {
    const connectedCzech = [
      createTestNode({
        text: "Na cestě",
        key: "on-the-road-title",
        connected: true,
      }),
    ];
    visitWithState({
      config: PAGE_COPY_LANGUAGE,
      selectedNodes: connectedCzech,
      allNodes: connectedCzech,
    });

    cy.iframe().contains("Na cestě").should("be.visible");

    cy.iframe().findDcy("copy_view_pull_button").should("be.visible").click();

    cy.iframe().contains("Na cestu").should("be.visible");
  });
});
