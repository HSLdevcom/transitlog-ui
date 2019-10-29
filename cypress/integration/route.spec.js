describe("Route smoke tests", () => {
  const yesterday = Cypress.moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  function assertRouteSelected() {
    cy.getTestElement("journey-details-header", {timeout: 60000}).contains("2510");
    cy.get(".test-class-stop-marker").should("have.length.least", 2);
  }

  function assertJourneySelected(departureTime) {
    assertRouteSelected();
    cy.getTestElement("journey-stop-event", {timeout: 60000}).should("exist");
    const currentDate = yesterday.replace(/-/g, "");

    if (departureTime) {
      cy.url().should("include", `/journey/${currentDate}/${departureTime}/2510/1`);
    } else {
      cy.url().should("include", `/journey/${currentDate}`);
    }
  }

  beforeEach(() => {
    cy.visit(`/?date=${yesterday}`);
    cy.getTestElement("route-input").type("2510/1");
    cy.getTestElement("route-option-2510-1").click();
  });

  it("Finds a route and can select it", () => {
    cy.url().should((url) =>
      expect(url).to.include(`route.routeId=2510&route.direction=1`)
    );

    cy.getTestElement("journey-list").should("exist");
    assertRouteSelected();
  });

  it("Selects a journey of the route", () => {
    cy.getTestElement("observed-journey")
      .first()
      .click()
      .find(`[data-testid="journey-departure-time"]`)
      .text()
      .then((departureTime) => {
        const urlDepartureTime = departureTime.replace(":", "") + "00";
        assertJourneySelected(urlDepartureTime);
      });
  });

  it("Can select a weekly departure", () => {
    cy.getTestElement("sidebar-tab-journeys_by_week").click();
    cy.getTestElement("journeys-by-week-list").should("exist");
    cy.getTestElement("weekly-departure-time", {timeout: 10000}).should(
      "have.length.least",
      2
    );

    cy.getTestElement("weekly-departure-ok", {timeout: 10000})
      .first()
      .click({force: true});

    assertJourneySelected();
  });
});
