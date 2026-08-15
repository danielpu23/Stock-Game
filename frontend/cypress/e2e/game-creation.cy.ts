describe('Game Creation and Joining', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should navigate to create game page', () => {
    cy.get('[data-testid="create-game-btn"]').click();
    cy.url().should('include', '/create');
    cy.contains('h1', 'Create Game').should('be.visible');
  });

  it('should display create game form with required fields', () => {
    cy.visit('/create');
    cy.get('[data-testid="game-name-input"]').should('be.visible');
    cy.get('[data-testid="initial-cash-input"]').should('be.visible');
    cy.get('[data-testid="create-game-submit-btn"]').should('be.visible');
  });

  it('should show validation error when game name is empty', () => {
    cy.visit('/create');
    cy.get('[data-testid="create-game-submit-btn"]').click();
    cy.url().should('include', '/create');
  });

  it('should show validation error when initial cash is empty', () => {
    cy.visit('/create');
    cy.get('[data-testid="game-name-input"]').type('Test Game');
    cy.get('[data-testid="create-game-submit-btn"]').click();
    cy.url().should('include', '/create');
  });

  it('should navigate to join game page', () => {
    cy.get('[data-testid="join-game-btn"]').click();
    cy.url().should('include', '/join');
    cy.contains('h1', 'Join Game').should('be.visible');
  });

  it('should display join game form with invite code field', () => {
    cy.visit('/join');
    cy.get('[data-testid="invite-code-input"]').should('be.visible');
    cy.get('[data-testid="join-game-submit-btn"]').should('be.visible');
  });

  it('should show validation error when invite code is empty', () => {
    cy.visit('/join');
    cy.get('[data-testid="join-game-submit-btn"]').click();
    cy.url().should('include', '/join');
  });

  it('should show error for invalid invite code', () => {
    cy.visit('/join');
    cy.get('[data-testid="invite-code-input"]').type('INVALID');
    cy.get('[data-testid="join-game-submit-btn"]').click();
    cy.url().should('include', '/join');
  });
});