describe('My Games Page', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to my games page', () => {
    cy.get('[data-testid="my-games-btn"]').click();
    cy.url().should('include', '/my-games');
    cy.contains('h1', 'My Games').should('be.visible');
  });

  it('should display empty state when no games exist', () => {
    cy.get('[data-testid="my-games-btn"]').click();
    cy.url().should('include', '/my-games');
    cy.get('[data-testid="empty-state"]').should('be.visible');
  });

  it('should have button to create game from my games page', () => {
    cy.get('[data-testid="my-games-btn"]').click();
    cy.url().should('include', '/my-games');
    cy.get('[data-testid="create-first-game-btn"]').should('be.visible');
  });

  it('should navigate to create game from my games page', () => {
    cy.get('[data-testid="my-games-btn"]').click();
    cy.url().should('include', '/my-games');
    cy.get('[data-testid="create-first-game-btn"]').click();
    cy.url().should('include', '/create');
  });

  it('should display game cards when games exist', () => {
    cy.get('[data-testid="my-games-btn"]').click();
    cy.url().should('include', '/my-games');
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="game-card"]').length > 0) {
        cy.get('[data-testid="game-card"]').should('be.visible');
      }
    });
  });

  it('should return to home from my games page', () => {
    cy.get('[data-testid="my-games-btn"]').click();
    cy.url().should('include', '/my-games');
    cy.contains('button', 'Menu').click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');
  });
});