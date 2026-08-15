# Cypress E2E Tests

This directory contains end-to-end tests for the Stock Game frontend application using Cypress.

## Setup

The Cypress dependencies have already been installed:
- `cypress` - E2E testing framework
- `@testing-library/cypress` - Testing utilities for React components

## Running Tests

### Development Mode (Interactive)
```bash
npm run cypress:open
```
This opens the Cypress Test Runner where you can select and run tests interactively.

### Headless Mode (CI/CD)
```bash
npm run cypress:run
```
This runs all tests in headless mode (without browser UI).

## Test Structure

### Test Files
- `auth.cy.ts` - Authentication flow tests (login, register, form validation)
- `game-creation.cy.ts` - Game creation and joining tests
- `navigation.cy.ts` - Navigation and routing tests
- `my-games.cy.ts` - My Games page functionality tests
- `ui-components.cy.ts` - UI components and responsiveness tests

### Support Files
- `cypress.config.ts` - Cypress configuration
- `support/commands.ts` - Custom Cypress commands
- `support/e2e.ts` - Global test setup and teardown

## Test Coverage

The tests cover:
- ✅ Authentication flow (login/register forms and validation)
- ✅ Game creation and joining functionality
- ✅ Navigation between pages
- ✅ My Games page functionality
- ✅ UI component rendering and styling
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Form validation and error handling

## Requirements

Before running tests, ensure:
1. The frontend dev server is running: `npm run dev` (on port 5173)
2. The backend API is accessible (if testing authenticated flows)

## Test Data Attributes

The application uses `data-testid` attributes for reliable element selection in tests:
- `create-game-btn` - Main create game button
- `join-game-btn` - Main join game button
- `my-games-btn` - My games navigation button
- `username-input` - Username input field
- `password-input` - Password input field
- `email-input` - Email input field
- `game-name-input` - Game name input field
- `initial-cash-input` - Initial cash input field
- `invite-code-input` - Invite code input field
- `submit-button` - Form submit button
- `empty-state` - Empty state container
- `game-card` - Game card element

## Writing New Tests

When adding new tests:
1. Add `data-testid` attributes to elements you need to test
2. Create a new `.cy.ts` file in the `cypress/e2e/` directory
3. Use the existing test structure as a template
4. Run tests to verify they work correctly

## Troubleshooting

### Tests fail because backend is not running
- Start the backend server: `cd backend && ./mvnw spring-boot:run`
- Ensure the backend is running on port 8080

### Tests fail because frontend is not running
- Start the frontend dev server: `npm run dev`
- Ensure it's running on port 5173

### Timeout errors
- Increase timeout in `cypress.config.ts` if needed
- Check if the application is slow to load