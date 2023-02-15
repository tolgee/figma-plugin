import { DEFAULT_CREDENTIALS } from "@/browser/urlConfig";
import { visitWithState } from "../../common/tools";

describe("Sign in", () => {
  it("passes", () => {
    visitWithState({});
    cy.iframe()
      .findDcy("settings_input_api_url")
      .type(DEFAULT_CREDENTIALS.apiUrl);
    cy.iframe()
      .findDcy("settings_input_api_key")
      .type(DEFAULT_CREDENTIALS.apiKey);

    cy.iframe().findDcy("settings_button_validate").click();

    cy.iframe().contains("Credentials valid").should("be.visible");
    cy.iframe().contains("Current language").should("be.visible");

    cy.iframe()
      .findDcy("settings_input_language")
      .should("be.visible")
      .select("en");

    cy.iframe().findDcy("settings_button_save").click();

    cy.contains("No nodes selected").should("be.visible");
  });
});
