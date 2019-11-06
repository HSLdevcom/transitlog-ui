describe("Route smoke tests", () => {
  // Yesterday's data is kept in cache for longer which make the tests faster.
  const yesterday = Cypress.moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  beforeEach(() => {
    cy.visit(`/?date=${yesterday}`);

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("route-input").type("2510/1");
    cy.getTestElement("route-option-2510-1").click();
  });

  it("Finds a route and can select it", () => {
    cy.url().should((url) =>
      expect(url).to.include(`route.routeId=2510&route.direction=1`)
    );

    cy.getTestElement("journey-list").should("exist");
    cy.assertRouteSelected("2510");
  });

  it("Selects a journey of the route", () => {
    cy.getTestElement("observed-journey")
      .first()
      .click()
      .find(`[data-testid="journey-departure-time"]`)
      .text()
      .then((departureTime) => {
        cy.waitUntilLoadingFinishes();

        const urlDepartureTime = departureTime.replace(":", "") + "00";
        cy.assertJourneySelected("2510", urlDepartureTime);
      });
  });

  it("Can select a weekly departure", () => {
    cy.getTestElement("sidebar-tab-journeys_by_week").click();
    cy.getTestElement("journeys-by-week-list").should("exist");

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("weekly-departure-time", {timeout: 60000}).should(
      "have.length.least",
      2
    );

    cy.getTestElement("weekly-departure-ok", {timeout: 10000})
      .first()
      .click({force: true});

    cy.waitUntilLoadingFinishes();
    cy.assertJourneySelected("2510");
  });

  it("Can select a weekly departure in last stop arrival mode", () => {
    cy.getTestElement("sidebar-tab-journeys_by_week").click();
    cy.getTestElement("journeys-by-week-list").should("exist");

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("weekly-departure-time", {timeout: 60000})
      .should("have.length.least", 2)
      .first()
      .text()
      .as("first-departure-time");

    cy.getTestElement("observed-times-type-select").click();

    cy.waitUntil(
      () =>
        cy
          .getTestElement("weekly-departure-time", {timeout: 60000})
          .first()
          .text()
          .then((lastStopArrival) =>
            cy
              .get("@first-departure-time")
              .then((firstStopDeparture) => lastStopArrival !== firstStopDeparture)
          ),
      {timeout: 60000}
    );

    cy.getTestElement("weekly-departure-time", {timeout: 60000}).should(
      "have.length.least",
      2
    );

    cy.getTestElement("weekly-departure-ok", {timeout: 10000})
      .first()
      .click({force: true});

    cy.waitUntilLoadingFinishes();

    cy.assertJourneySelected("2510");
  });

  it("Can display the journey graph", () => {
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("observed-journey")
      .first()
      .click();

    cy.waitUntilLoadingFinishes();

    cy.assertJourneySelected("2510");

    cy.getTestElement("toggle-graph-button")
      .should("exist")
      .click();

    cy.getTestElement("journey-graph-container").should("visible");
    cy.get(".test-class-journey-graph").should("exist");
  });
});
