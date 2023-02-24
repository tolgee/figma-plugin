import { DEFAULT_CREDENTIALS } from "@/web/urlConfig";
import { visitWithState } from "../common/tools";

describe("Settings", () => {
  it("hides navigation", () => {
    visitWithState({
      config: {},
    });

    cy.iframe().findDcy("top_bar_back_button").should("not.exist");
    cy.iframe().findDcy("settings_button_close").should("not.exist");
  });

  it("works when filling empty", () => {
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

  it("works when filling existing", () => {
    visitWithState({
      config: {
        apiUrl: "invalid",
        apiKey: "invalid",
        language: "cs",
        namespace: "",
        documentInfo: true,
        pageInfo: true,
      },
    });

    cy.iframe().findDcy("index_settings_button").should("be.visible").click();
    cy.iframe().contains("Settings").should("be.visible");

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
