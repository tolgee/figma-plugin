import { DEFAULT_CREDENTIALS } from "@/browser/urlConfig";
import { visitWithState } from "../../common/tools";

describe("Sign in", () => {
  it("passes", () => {
    visitWithState({ config: DEFAULT_CREDENTIALS });
    cy.gcy("settings_input_api_url").should("exist");
  });
});
