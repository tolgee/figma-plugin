import { DEFAULT_CREDENTIALS } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Key format editor", () => {
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

    cy.iframe().findDcy("index_settings_button").click();
    cy.iframe().findDcy("settings_expandable_strings").click();
    cy.iframe().findDcy("global-editor").click();
    cy.iframe().find(".cm-content").as("editorContent");
    cy.iframe().find(".cm-tooltip-autocomplete").should("be.visible");
    cy.wait(150);

    cy.get("@editorContent").type("{enter}").should("have.text", "artboard");
    cy.iframe().find(".cm-tooltip-autocomplete").should("not.exist");
    cy.get("@editorContent").type(".component");
    cy.iframe().find(".cm-tooltip-autocomplete").should("be.visible");
    cy.wait(150);
    cy.get("@editorContent")
      .type("{enter}")
      .should("have.text", "artboard.component");
    cy.iframe().find(".cm-tooltip-autocomplete").should("not.exist");
  });
});
