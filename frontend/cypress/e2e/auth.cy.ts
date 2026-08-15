describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display home page with main action buttons', () => {
    cy.get('[data-testid="create-game-btn"]').should('be.visible');
    cy.get('[data-testid="join-game-btn"]').should('be.visible');
    cy.get('[data-testid="my-games-btn"]').should('be.visible');
  });

  it('should navigate to login page', () => {
    cy.visit('/login');
    cy.url().should('include', '/login');
    cy.contains('h1', 'Login').should('be.visible');
  });

  it('should navigate to register page', () => {
    cy.visit('/register');
    cy.url().should('include', '/register');
    cy.contains('h1', 'Register').should('be.visible');
  });

  it('should display login form with required fields', () => {
    cy.visit('/login');
    cy.get('[data-testid="username-input"]').should('be.visible');
    cy.get('[data-testid="password-input"]').should('be.visible');
    cy.get('[data-testid="submit-button"]').should('be.visible');
  });

  it('should display register form with required fields', () => {
    cy.visit('/register');
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
    cy.visit('/register');
    cy.get('[data-testid="submit-button"]').click();
    cy.url().should('include', '/register');
  });
});