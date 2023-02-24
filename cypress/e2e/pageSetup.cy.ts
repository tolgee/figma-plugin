import { NEW_PAGE, SIGNED_IN } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Page setup", () => {
  it("shows form with language", () => {
    visitWithState({
      config: NEW_PAGE,
    });

    cy.iframe().contains("Page setup").should("be.visible");

    cy.iframe()
      .findDcy("page_setup_button_save")
      .should("be.visible")
      .should("be.disabled");

    cy.iframe()
      .findDcy("page_setup_input_language")
      .should("be.visible")
      .select("cs");

    cy.iframe().findDcy("page_setup_button_save").should("be.visible").click();

    cy.iframe().contains("No nodes selected").should("be.visible");
  });
});
