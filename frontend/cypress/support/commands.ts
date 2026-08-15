// Custom Cypress commands

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      createGame(gameName: string, initialCash: number): Chainable<void>;
      joinGame(inviteCode: string): Chainable<void>;
      navigateToMyGames(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/login');
  cy.get('input[type="text"]').type(username);
  cy.get('input[type="password"]').type(password);
  cy.get('button').contains('Login').click();
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('createGame', (gameName: string, initialCash: number) => {
  cy.visit('/create');
  cy.get('input[placeholder*="Game Name"]').type(gameName);
  cy.get('input[placeholder*="Initial Cash"]').clear().type(initialCash.toString());
  cy.get('button').contains('Create Game').click();
  cy.url().should('include', '/lobby');
});

Cypress.Commands.add('joinGame', (inviteCode: string) => {
  cy.visit('/join');
  cy.get('input[placeholder*="Invite Code"]').type(inviteCode);
  cy.get('button').contains('Join Game').click();
});

Cypress.Commands.add('navigateToMyGames', () => {
  cy.visit('/');
  cy.get('button').contains('My Games').click();
  cy.url().should('include', '/my-games');
});

export {};