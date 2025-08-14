import { NEW_PAGE } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Page setup", () => {
  it("shows form with language", () => {
    visitWithState({
      config: NEW_PAGE,
    });
    cy.iframeBody().within(() => {
      cy.get("div").contains("Page setup").should("be.visible");

      cy.gcy("page_setup_button_save")
        .should("be.visible")
        .should("be.disabled");

      cy.gcy("page_setup_input_language").should("be.visible").select("cs");

      cy.gcy("page_setup_button_save").should("be.visible").click();

      cy.get("div")
        .contains("Select texts for translation")
        .should("be.visible");
    });
  });
});
