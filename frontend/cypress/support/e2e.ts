import "./commands";

beforeEach(() => {
  cy.clearCookies();
});

Cypress.on("window:before:load", (win) => {
  cy.stub(win, "alert").as("alert");
});
