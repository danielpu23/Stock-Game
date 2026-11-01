describe('My Games Page - Unauthenticated', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should redirect to login when trying to access my games', () => {
    cy.visit('/my-games');
    cy.url().should('include', '/login');
  });
});