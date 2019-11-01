/// <reference types="Cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    getTestElement<Subject>(testId: string, options?: CommandOptions): Chainable<Subject>;
    hslLogin(): void;
    assertRouteSelected(routeId?: string): void;
    assertJourneySelected(routeId?: string, departureTime?: string): void;
  }
}
