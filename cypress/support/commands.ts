/* eslint-disable @typescript-eslint/no-namespace */
import "cypress-iframe";

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
    }
  }
}

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
    .then((e) => cy.wrap<HTMLBodyElement>(e as HTMLBodyElement));
});

// Export {} to ensure this file is treated as a module by TypeScript.
export {};
