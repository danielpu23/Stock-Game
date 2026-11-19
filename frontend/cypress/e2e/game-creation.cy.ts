describe('Game Creation and Joining - Unauthenticated', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should redirect to login when trying to access create game', () => {
    cy.visit('/create');
    cy.url().should('include', '/login');
  });

  it('should redirect to login when trying to access join game', () => {
    cy.visit('/join');
    cy.url().should('include', '/login');
  });

  it('should redirect to login when trying to access my games', () => {
    cy.visit('/my-games');
    cy.url().should('include', '/login');
  });
});