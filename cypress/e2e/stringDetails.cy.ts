import {
  createTestNode,
  PAGE_STRING_DETAILS,
  SIGNED_IN,
} from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

const getIframeDocument = () => {
  return (
    cy
      .get('iframe[data-cy="plugin_iframe"]')
      // Cypress yields jQuery element, which has the real
      // DOM element under property "0".
      // From the real DOM iframe element we can get
      // the "document" element, it is stored in "contentDocument" property
      // Cypress "its" command can access deep properties using dot notation
      // https://on.cypress.io/its
      .its("0.contentDocument")
      .should("exist")
  );
};

const getIframeBody = () => {
  // get the document
  return (
    getIframeDocument()
      // automatically retries until body is loaded
      .its("body")
      .should("not.be.undefined")
      // wraps "body" DOM element to allow
      // chaining more Cypress commands, like ".find(...)"
      .then(cy.wrap)
  );
};

describe("String details", () => {
  it("should get there from index page", () => {
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

    cy.iframe().contains("test_key").should("be.visible");

    cy.iframe().findDcy("key_options_button").should("be.visible").click();

    cy.iframe().findDcy("dropdown").should("be.visible");

    cy.iframe().findDcy("string_details_cy").should("be.visible");
  });

  it("should show the correct preview text", () => {
    const nodes = [
      createTestNode({
        text: "Test node",
        key: "test_key",
        ns: "test_ns",
        connected: true,
      }),
    ];
    visitWithState({
      config: { ...PAGE_STRING_DETAILS, nodeInfo: nodes[0] },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    // Should show the key as preview text
    cy.iframe()
      .findDcy("string_details_preview_text")
      .should("be.visible")
      .contains("Test node");
  });

  it("should react to key changes", async () => {
    const nodes = [
      createTestNode({
        text: "Test node",
        key: "test_key",
        ns: "test_ns",
        connected: true,
      }),
    ];
    visitWithState({
      config: { ...PAGE_STRING_DETAILS, nodeInfo: nodes[0] },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    getIframeBody()
      .find('[data-cy="string_details_input_key"]')
      .should("have.value", "test_key");

    getIframeBody()
      .find('[data-cy="string_details_input_key"]')
      .type("new_key");

    getIframeBody()
      .find('[data-cy="string_details_input_key"]')
      .should("have.value", "new_key");

    getIframeBody().find('[data-cy="tooltip"]').click();

    getIframeBody()
      .contains("You can use basic HTML tags")
      .should("be.visible");

    await new Promise((r) => setTimeout(r, 500));
  });

  it("should show negative warning on missmatched translation", () => {
    const nodes = [
      createTestNode({
        text: "Test node",
        key: "test_key",
        ns: "test_ns",
        isPlural: true,
        translation: "Test translation",
        connected: true,
      }),
    ];
    visitWithState({
      config: { ...PAGE_STRING_DETAILS, nodeInfo: nodes[0] },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframe().contains("Advanced text format detected").should("be.visible");

    cy.iframe().find('[class^="_warningContainer_"]').should("be.visible");
  });

  it("should show positive warning on plural keys", () => {
    const nodes = [
      createTestNode({
        text: "Test node",
        key: "test_key",
        ns: "test_ns",
        isPlural: true,
        translation: "Test node",
        connected: true,
      }),
    ];
    visitWithState({
      config: { ...PAGE_STRING_DETAILS, nodeInfo: nodes[0] },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    cy.iframe().contains("Advanced text format detected").should("be.visible");

    cy.iframe()
      .find('[class^="_warningNoticeContainer_"]')
      .should("be.visible");
  });

  it("should not show warning on simple keys", () => {
    const nodes = [
      createTestNode({
        text: "Test node",
        key: "test_key",
        ns: "test_ns",
        isPlural: false,
        translation: "Test",
        connected: true,
      }),
    ];
    visitWithState({
      config: { ...PAGE_STRING_DETAILS, nodeInfo: nodes[0] },
      selectedNodes: nodes,
      allNodes: nodes,
    });

    getIframeBody()
      .contains("Advanced text format detected")
      .should("not.exist");
  });
});
