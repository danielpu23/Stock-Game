describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should redirect to login when not authenticated', () => {
    cy.url().should('include', '/login');
  });

  it('should navigate to login page', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.contains('h1', 'Login').should('be.visible');
  });

  it('should toggle to register page', () => {
    cy.visit('/login');
    cy.contains('button', 'Register').click();
    cy.contains('h1', 'Register').should('be.visible');
  });

  it('should display login form with required fields', () => {
    cy.visit('/login');
    cy.get('[data-testid="username-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="submit-button"]').should('be.visible');
  });

  it('should display register form with required fields', () => {
    cy.visit('/login');
    cy.contains('button', 'Register').click();
    cy.get('[data-testid="username-input"]').should('be.visible');
    cy.get('[data-testid="email-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="submit-button"]').should('be.visible');
  });

  it('should show validation error when login fields are empty', () => {
    cy.visit('/login');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/login');
  });

  it('should show validation error when register fields are empty', () => {
    cy.visit('/login');
    cy.contains('button', 'Register').click();
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/login');
  });
});