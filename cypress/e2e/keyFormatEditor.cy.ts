import { DEFAULT_CREDENTIALS } from "@/web/urlConfig";
import { EditorView } from "@codemirror/view";
import { visitWithState } from "../common/tools";

function openEditor() {
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
}

function getEditorView(): Cypress.Chainable<EditorView> {
  return cy.get("@editorContent").then(($content) => {
    const view = EditorView.findFromDOM($content[0]);
    expect(view).not.to.be.null;
    return view!;
  });
}

function acceptSelectedCompletion(): Cypress.Chainable<number> {
  cy.wait(200);
  return getEditorView()
    .then((view) => {
      const frameWindow = view.contentDOM.ownerDocument.defaultView;
      expect(frameWindow).not.to.be.null;
      view.contentDOM.dispatchEvent(
        new frameWindow!.KeyboardEvent("keydown", {
          key: "Enter",
          code: "Enter",
          bubbles: true,
          cancelable: true,
        }),
      );
      return view.state.selection.main.assoc;
    })
    .then((assoc) =>
      cy
        .iframeBody()
        .find(".cm-tooltip-autocomplete")
        .should("not.exist")
        .then(() => assoc),
    );
}

describe("Key format editor", () => {
  it("preserves cursor association after completion", () => {
    openEditor();
    acceptSelectedCompletion().should("equal", -1);
  });

  it("opens completion when a placeholder badge is clicked", () => {
    openEditor();
    acceptSelectedCompletion();

    cy.iframeBody().find(".placeholder-widget").click();
    cy.iframeBody().find(".cm-tooltip-autocomplete").should("be.visible");
  });

  it("keeps separators between inserted placeholders", () => {
    openEditor();
    acceptSelectedCompletion();

    getEditorView().then((view) => {
      const position = view.state.selection.main.head;
      const insert = ".component";
      view.dispatch({
        changes: { from: position, insert },
        selection: { anchor: position + insert.length },
        userEvent: "input.type",
      });
    });
    cy.iframeBody().find(".cm-tooltip-autocomplete").should("be.visible");
    acceptSelectedCompletion();

    getEditorView()
      .its("state.doc")
      .invoke("toString")
      .should("equal", "{artboard}.{component}");
    cy.get("@editorContent").should("have.text", "artboard.component");
  });
});
