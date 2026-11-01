// Custom Cypress commands with localStorage mocking

declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      createGame(gameName: string, initialCash: number): Chainable<void>;
      joinGame(inviteCode: string): Chainable<void>;
      navigateToMyGames(): Chainable<void>;
      mockAuthUser(): Chainable<void>;
      visitWithAuth(url: string): Chainable<void>;
      mockAuthApi(): Chainable<void>;
      mockGameApi(): Chainable<void>;
    }
  }
}

// Mock authentication by setting localStorage directly
Cypress.Commands.add('mockAuthUser', () => {
  cy.clearLocalStorage();
  const mockUser = { id: 1, username: 'testuser' };
  const mockToken = 'mock-jwt-token-12345';
  cy.window().then((win) => {
    win.localStorage.setItem('test_mode', 'true');
    win.localStorage.setItem('user_data', JSON.stringify(mockUser));
    win.localStorage.setItem('jwt_token', mockToken);
  });
});

// Visit a page with mocked authentication
Cypress.Commands.add('visitWithAuth', (url: string) => {
  cy.clearLocalStorage();
  const mockUser = { id: 1, username: 'testuser' };
  const mockToken = 'mock-jwt-token-12345';
  cy.visit(url, {
    onBeforeLoad: (win) => {
      win.localStorage.setItem('test_mode', 'true');
      win.localStorage.setItem('user_data', JSON.stringify(mockUser));
      win.localStorage.setItem('jwt_token', mockToken);
    }
  });
});

// Mock authentication API responses (for register/login API calls)
Cypress.Commands.add('mockAuthApi', () => {
  cy.intercept('POST', '**/api/auth/register', {
    statusCode: 200,
    body: { message: 'User registered successfully' }
  }).as('registerRequest');

  cy.intercept('POST', '**/api/auth/login', {
    statusCode: 200,
    body: {
      token: 'mock-jwt-token-12345',
      id: 1,
      username: 'testuser'
    }
  }).as('loginRequest');
});

// Mock game API responses
Cypress.Commands.add('mockGameApi', () => {
  cy.intercept('POST', '**/api/games', {
    statusCode: 200,
    body: {
      id: 1,
      name: 'Test Game',
      inviteCode: 'TEST123',
      status: 'WAITING',
      initialCash: 10000,
      createdBy: {
        id: 1,
        username: 'testuser'
      }
    }
  }).as('createGameRequest');

  cy.intercept('POST', '**/api/games/join', {
    statusCode: 200,
    body: {
      id: 1,
      name: 'Test Game',
      inviteCode: 'TEST123',
      status: 'WAITING',
      initialCash: 10000
    }
  }).as('joinGameRequest');

  cy.intercept('GET', '**/api/games/my-games', {
    statusCode: 200,
    body: []
  }).as('myGamesRequest');
});

Cypress.Commands.add('login', (username: string, password: string) => {
  cy.mockAuthApi();
  cy.visit('/login');
  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="submit-button"]').click();
  cy.wait('@loginRequest');
  cy.url().should('not.include', '/login');
});

Cypress.Commands.add('createGame', (gameName: string, initialCash: number) => {
  cy.mockGameApi();
  cy.visit('/create');
  cy.get('[data-testid="game-name-input"]').type(gameName);
  cy.get('[data-testid="initial-cash-input"]').clear().type(initialCash.toString());
  cy.get('[data-testid="create-game-submit-btn"]').click();
  cy.wait('@createGameRequest');
});

Cypress.Commands.add('joinGame', (inviteCode: string) => {
  cy.mockGameApi();
  cy.visit('/join');
  cy.get('[data-testid="invite-code-input"]').type(inviteCode);
  cy.get('[data-testid="join-game-submit-btn"]').click();
  cy.wait('@joinGameRequest');
});

Cypress.Commands.add('navigateToMyGames', () => {
  cy.mockGameApi();
  cy.visit('/');
  cy.get('[data-testid="my-games-btn"]').click();
  cy.wait('@myGamesRequest');
  cy.url().should('include', '/my-games');
});

export {};