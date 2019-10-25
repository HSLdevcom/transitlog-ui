import {departureTime} from "../../src/helpers/time";

describe("Route smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getTestElement("select-lang-fi");
  });

  it("Finds a route and can select it", () => {
    cy.getTestElement("route-input").type("2510/1");
    cy.getTestElement("route-option-2510-1").click();
    cy.url().should((url) =>
      expect(url).to.include(`route.routeId=2510&route.direction=1`)
    );
    cy.getTestElement("journey-list-header").should("ok");
  });

  it("Selects a journey of the route", () => {
    cy.getTestElement("route-input").type("2510/1");
    cy.getTestElement("route-option-2510-1").click();

    cy.getTestElement("observed-journey")
      .first()
      .click()
      .find(`> span`)
      .first()
      .text()
      .then((departureTime) => {
        const urlDepartureTime = departureTime.replace(":", "") + "00";

        cy.getTestElement("journey-details-header", {timeout: 60000}).contains("2510");
        cy.getTestElement("journey-stop-event").should("ok");

        const currentDate = Cypress.moment().format("YYYYMMDD");
        cy.url().should("include", `/journey/${currentDate}/${urlDepartureTime}/2510/1`);
      });
  });
});
