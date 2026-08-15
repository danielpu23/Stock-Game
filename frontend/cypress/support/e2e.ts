// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// This file is used to configure Cypress for E2E testing
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
  // Clear cookies before each test
  cy.clearCookies();
});