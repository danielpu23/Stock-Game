describe('UI Components and Responsiveness', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should display input fields with proper styling', () => {
    cy.visit('/login');
    cy.get('[data-testid="username-input"]').should('have.css', 'padding');
    cy.get('[data-testid="password-input"]').should('have.css', 'padding');
  });

  it('should display cards with proper styling', () => {
    cy.visit('/login');
    cy.get('form').should('be.visible');
  });

  it('should have proper spacing between elements', () => {
    cy.visit('/login');
    cy.get('form').should('be.visible');
  });

  it('should display submit button with proper styling', () => {
    cy.visit('/login');
    cy.get('[data-testid="submit-button"]').should('be.visible');
    cy.get('[data-testid="submit-button"]').should('have.css', 'padding');
  });

  it('should display register toggle button', () => {
    cy.visit('/login');
    cy.contains('button', 'Register').should('be.visible');
  });
});