describe('Navigation and Routing', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should handle direct URL navigation to login', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.contains('h1', 'Login').should('be.visible');
  });

  it('should redirect protected routes to login', () => {
    cy.visit('/create');
    cy.url().should('include', '/login');

    cy.visit('/join');
    cy.url().should('include', '/login');

    cy.visit('/my-games');
    cy.url().should('include', '/login');
  });

  it('should toggle between login and register on same page', () => {
    cy.visit('/login');
    cy.contains('h1', 'Login').should('be.visible');
    cy.contains('button', 'Register').click();
    cy.contains('h1', 'Register').should('be.visible');
    cy.contains('button', 'Login').click();
    cy.contains('h1', 'Login').should('be.visible');
  });
});