import "cypress-iframe";

Cypress.Commands.add("closestDcy", { prevSubject: true }, (subject, dataCy) => {
  return subject.closest(`[data-cy="${dataCy}"]`);
});

Cypress.Commands.add("gcy", (dataCy) => {
  return cy.get(`[data-cy="${dataCy}"]`);
});

Cypress.Commands.add("findDcy", { prevSubject: true }, (subject, dataCy) => {
  return subject.find(`[data-cy="${dataCy}"]`);
});
