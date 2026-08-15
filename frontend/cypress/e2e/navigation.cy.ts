describe('Navigation and Routing', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate between home and create game pages', () => {
    cy.get('[data-testid="create-game-btn"]').click();
    cy.url().should('include', '/create');
    cy.go('back');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should navigate between home and join game pages', () => {
    cy.get('[data-testid="join-game-btn"]').click();
    cy.url().should('include', '/join');
    cy.go('back');
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });

  it('should navigate to my games page', () => {
    cy.get('[data-testid="my-games-btn"]').click();
    cy.url().should('include', '/my-games');
    cy.contains('h1', 'My Games').should('be.visible');
  });

  it('should handle direct URL navigation', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.visit('/register');
    cy.url().should('include', '/register');
    cy.visit('/create');
    cy.url().should('include', '/create');
    cy.visit('/join');
    cy.url().should('include', '/join');
    cy.visit('/my-games');
    cy.url().should('include', '/my-games');
  });

  it('should return to home from any page', () => {
    cy.visit('/login');
    cy.contains('button', 'Menu').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    cy.visit('/create');
    cy.contains('button', 'Menu').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    cy.visit('/my-games');
    cy.contains('button', 'Menu').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});