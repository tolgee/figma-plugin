/* eslint-disable @typescript-eslint/no-namespace */

Cypress.Commands.add(
  "closestDcy",
  { prevSubject: true },
  (subject: Cypress.Chainable, dataCy) => {
    return subject.closest(`[data-cy="${dataCy}"]`);
  }
);

Cypress.Commands.add("gcy", (dataCy) => {
  return cy.get(`[data-cy="${dataCy}"]`);
});

Cypress.Commands.add(
  "findDcy",
  { prevSubject: true },
  (subject: Cypress.Chainable, dataCy) => {
    return subject.find(`[data-cy="${dataCy}"]`, { timeout: 30000 });
  }
);

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to get the document of the plugin iframe.
       * @example cy.iframeDocument().should('exist')
       */
      iframeDocument(): Chainable<Document>;
      /**
       * Custom command to get the body of the plugin iframe.
       * @example cy.iframeBody().find('button').click()
       */
      iframeBody(): Chainable<JQuery<HTMLBodyElement>>;

      iframeReady(): void;
    }
  }
}

Cypress.Commands.add("iframeReady", () => {
  return cy
    .get('iframe[data-cy="plugin_iframe"]', { timeout: 15000 })
    .should("be.visible")
    .its("0.contentDocument")
    .should("exist")
    .then((doc: Document) => {
      // Wait for readyState=complete AND #root present
      // Both checks are retried by Cypress
      cy.wrap(doc).its("readyState").should("eq", "complete");
      cy.wrap(doc.body).should("exist");
      cy.wrap(doc).find("#root", { timeout: 15000 }).should("exist");
    });
});

Cypress.Commands.add("iframeDocument", () => {
  return cy
    .get('iframe[data-cy="plugin_iframe"]')
    .its("0.contentDocument")
    .should("exist");
});

Cypress.Commands.add("iframeBody", () => {
  return cy
    .iframeDocument()
    .its("body")
    .should("not.be.undefined")
    .then((e) => {
      return cy.wrap<HTMLBodyElement>(e as HTMLBodyElement);
    });
});

// Export {} to ensure this file is treated as a module by TypeScript.
export {};
