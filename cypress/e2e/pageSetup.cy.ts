import { NEW_PAGE } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Page setup", () => {
  it("shows form with language", () => {
    visitWithState({
      config: NEW_PAGE,
    });

    cy.iframeBody().contains("Page setup").should("be.visible");

    cy.iframeBody()
      .findDcy("page_setup_button_save")
      .should("be.visible")
      .should("be.disabled");

    cy.iframeBody()
      .findDcy("page_setup_input_language")
      .should("be.visible")
      .select("cs");

    cy.iframeBody()
      .findDcy("page_setup_button_save")
      .should("be.visible")
      .click();

    cy.iframeBody()
      .contains("Select texts for translation")
      .should("be.visible");
  });
});
