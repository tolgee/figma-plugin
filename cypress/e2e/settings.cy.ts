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

    cy.iframe().findDcy("settings_section_project").should("be.visible");
    cy.iframe().findDcy("settings_section_project").click();

    cy.iframe()
      .findDcy("settings_input_api_url")
      .type(DEFAULT_CREDENTIALS.apiUrl);
    cy.iframe()
      .findDcy("settings_input_api_key")
      .type(DEFAULT_CREDENTIALS.apiKey);

    cy.iframe().findDcy("settings_button_validate").click();

    cy.iframe()
      .contains("examples was successfully connected")
      .should("be.visible");
    cy.iframe().contains("Current language").should("be.visible");

    cy.iframe()
      .findDcy("settings_input_language")
      .should("be.visible")
      .select("en");

    cy.iframe().findDcy("settings_button_save").click();

    cy.contains("Select texts for translation").should("be.visible");
  });

  it("works when filling existing", () => {
    visitWithState({
      config: {
        apiUrl: "invalid",
        apiKey: undefined,
        language: "cs",
        namespace: "",
        documentInfo: true,
        pageInfo: true,
      },
    });

    cy.iframe().findDcy("index_settings_button").should("be.visible").click();
    cy.iframe().contains("Settings").should("be.visible");

    cy.iframe().findDcy("settings_section_project").should("be.visible");
    cy.iframe().findDcy("settings_section_project").click();

    cy.iframe()
      .findDcy("settings_input_api_url")
      .type(DEFAULT_CREDENTIALS.apiUrl);
    cy.iframe()
      .findDcy("settings_input_api_key")
      .type(DEFAULT_CREDENTIALS.apiKey);

    cy.iframe().findDcy("settings_button_validate").click();

    cy.iframe()
      .contains("examples was successfully connected")
      .should("be.visible");
    cy.iframe().contains("Current language").should("be.visible");

    cy.iframe()
      .findDcy("settings_input_language")
      .should("be.visible")
      .select("en");

    cy.iframe().findDcy("settings_button_save").click();

    cy.contains("Select texts for translation").should("be.visible");
  });

  it("tests strings settings configuration", () => {
    visitWithState({
      config: {
        apiUrl: DEFAULT_CREDENTIALS.apiUrl,
        apiKey: DEFAULT_CREDENTIALS.apiKey,
        language: "en",
        namespace: "",
        documentInfo: true,
        pageInfo: true,
      },
    });

    cy.iframe().findDcy("index_settings_button").should("be.visible").click();
    cy.iframe().contains("Settings").should("be.visible");

    cy.iframe().findDcy("settings_expandable_strings").should("exist").click();
    // Test key format editor - check if it exists first
    cy.iframe().findDcy("global-editor").should("exist");

    // Test variable casing dropdown - only if it's visible
    cy.iframe().findDcy("settings_dropdown_variable_casing").should("exist");

    // Verify preview exists
    cy.iframe().findDcy("settings_text_preview").should("exist");

    // Test ignore settings - only if they're visible
    cy.iframe().findDcy("settings_checkbox_ignore_text_layers").should("exist");

    // Test ignore prefix input - only if it's visible
    cy.iframe().findDcy("settings_input_ignore_prefix").should("exist");

    // Save settings
    cy.iframe().findDcy("settings_button_save").click();
    cy.contains("Select texts for translation").should("be.visible");
  });

  it("tests push settings configuration", () => {
    visitWithState({
      config: {
        apiUrl: DEFAULT_CREDENTIALS.apiUrl,
        apiKey: DEFAULT_CREDENTIALS.apiKey,
        language: "en",
        namespace: "",
        documentInfo: true,
        pageInfo: true,
      },
    });
    cy.iframe().findDcy("index_settings_button").should("be.visible").click();
    cy.iframe().contains("Settings").should("be.visible");

    cy.iframe().findDcy("settings_expandable_push").should("exist").click();

    // Test update screenshots checkbox
    cy.iframe().findDcy("settings_checkbox_update_screenshots").should("exist");

    // Test add tags checkbox
    cy.iframe().findDcy("settings_checkbox_add_tags").should("exist");

    // Save settings
    cy.iframe().findDcy("settings_button_save").click();
    cy.contains("Select texts for translation").should("be.visible");
  });

  it("tests complete settings workflow with all sections", () => {
    visitWithState({
      config: {
        apiUrl: "invalid",
        apiKey: undefined,
        language: "cs",
        namespace: "",
        documentInfo: true,
        pageInfo: true,
      },
    });

    cy.iframe().findDcy("index_settings_button").should("be.visible").click();
    cy.iframe().contains("Settings").should("be.visible");

    // Configure project settings
    cy.iframe()
      .findDcy("settings_input_api_url")
      .should("be.visible")
      .clear()
      .type(DEFAULT_CREDENTIALS.apiUrl);
    cy.iframe()
      .findDcy("settings_input_api_key")
      .should("be.visible")
      .clear()
      .type(DEFAULT_CREDENTIALS.apiKey);
    cy.iframe().findDcy("settings_button_validate").click();
    cy.iframe()
      .contains("examples was successfully connected")
      .should("be.visible");

    cy.iframe().findDcy("settings_input_language").select("en");

    // Configure strings settings
    cy.iframe().contains("Strings and Keys").should("be.visible");
    cy.iframe().findDcy("settings_expandable_strings").should("exist").click();
    cy.iframe().findDcy("global-editor").should("exist");
    cy.iframe().findDcy("settings_dropdown_variable_casing").should("exist");
    cy.iframe().findDcy("settings_checkbox_ignore_text_layers").should("exist");
    cy.iframe().findDcy("settings_input_ignore_prefix").should("exist");

    // Configure push settings
    cy.iframe().contains("Push").should("be.visible");
    cy.iframe().findDcy("settings_expandable_push").should("exist").click();
    cy.iframe().findDcy("settings_button_save").click();

    // Verify we're back to the main view
    cy.contains("Select texts for translation").should("be.visible");
  });
});
