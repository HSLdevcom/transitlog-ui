/// <reference types="Cypress" />

declare namespace Cypress {
  interface Chainable<Subject = any> {
    getTestElement<Subject>(testId: string, options?: CommandOptions): Chainable<Subject>;
    hslLogin(): void;
    visitAndSpy(path: string): void;
    assertRouteSelected(routeId?: string): void;
    assertJourneySelected(routeId?: string, departureTime?: string): void;
    waitUntilLoadingFinishes<Subject>(
      loadingElementSelector?: string
    ): Chainable<Subject>;
  }
}
