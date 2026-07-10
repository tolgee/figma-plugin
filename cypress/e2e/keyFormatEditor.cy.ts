import { DEFAULT_CREDENTIALS } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe.skip("Key format editor", () => {
  it("keeps separators between inserted placeholders", () => {
    visitWithState({
      config: {
        apiUrl: DEFAULT_CREDENTIALS.apiUrl,
        apiKey: DEFAULT_CREDENTIALS.apiKey,
        language: "en",
        namespace: "",
        documentInfo: true,
        pageInfo: true,
        prefillKeyFormat: true,
        keyFormat: "",
      },
    });

    cy.iframeBody()
      .find('[data-cy="index_settings_button"]')
      .should("be.visible")
      .click();
    cy.iframeBody()
      .find('[data-cy="settings_expandable_strings"]')
      .should("be.visible")
      .click();
    cy.iframeBody()
      .find('[data-cy="global-editor"]')
      .should("be.visible")
      .click();
    cy.iframeBody().find(".cm-content").as("editorContent");
    cy.iframeBody().find(".cm-tooltip-autocomplete").should("be.visible");
    cy.wait(150);

    cy.get("@editorContent").type("{enter}").should("have.text", "artboard");
    cy.iframeBody().find(".cm-tooltip-autocomplete").should("not.exist");
    cy.get("@editorContent").type(".component");
    cy.iframeBody().find(".cm-tooltip-autocomplete").should("be.visible");
    cy.wait(150);
    cy.get("@editorContent")
      .type("{enter}")
      .should("have.text", "artboard.component");
    cy.iframeBody().find(".cm-tooltip-autocomplete").should("not.exist");
  });
});
