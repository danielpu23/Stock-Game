describe('UI Components and Responsiveness', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display navbar with menu button', () => {
    cy.contains('button', 'Menu').should('be.visible');
  });

  it('should display all main action buttons on home page', () => {
    cy.get('[data-testid="create-game-btn"]').should('be.visible');
    cy.get('[data-testid="join-game-btn"]').should('be.visible');
    cy.get('[data-testid="my-games-btn"]').should('be.visible');
  });

  it('should have responsive design on mobile viewport', () => {
    cy.viewport(375, 667); // iPhone 8
    cy.visit('/');
    cy.contains('button', 'Menu').should('be.visible');
    cy.get('[data-testid="create-game-btn"]').should('be.visible');
  });

  it('should have responsive design on tablet viewport', () => {
    cy.viewport(768, 1024); // iPad
    cy.visit('/');
    cy.contains('button', 'Menu').should('be.visible');
    cy.get('[data-testid="create-game-btn"]').should('be.visible');
  });

  it('should display cards with proper styling', () => {
    cy.visit('/my-games');
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-card"]').length > 0) {
        cy.get('[data-testid="game-card"]').should('have.css', 'border-radius');
        cy.get('[data-testid="game-card"]').should('have.css', 'box-shadow');
      }
    });
  });

  it('should display buttons with hover effects', () => {
    cy.visit('/');
    cy.get('[data-testid="create-game-btn"]')
      .should('have.css', 'transition')
      .trigger('mouseover')
      .should('have.css', 'cursor', 'pointer');
  });

  it('should display input fields with proper styling', () => {
    cy.visit('/login');
    cy.get('[data-testid="username-input"]').should('have.css', 'padding');
    cy.get('[data-testid="password-input"]').should('have.css', 'padding');
  });

  it('should have proper spacing between elements', () => {
    cy.visit('/');
    cy.get('button').should('have.css', 'margin');
  });
});