describe("Route smoke tests", () => {
  // Yesterday's data is kept in cache for longer which make the tests faster.
  const yesterday = Cypress.moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  const oneWeekAgo = Cypress.moment()
    .subtract(1, "week")
    .startOf("isoWeek")
    .format("YYYY-MM-DD");

  it("Finds a route and can select it", () => {
    cy.visit(`/?date=${yesterday}`);

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.url().should((url) =>
      expect(url).to.include(`route.routeId=1018&route.direction=1`)
    );

    cy.getTestElement("journey-list").should("exist");
    cy.assertRouteSelected("1018");
  });

  it("Selects a journey of the route", () => {
    cy.visit(`/?date=${yesterday}`);

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.getTestElement("observed-journey")
      .first()
      .click()
      .find(`[data-testid="journey-departure-time"]`)
      .text()
      .then((departureTime) => {
        cy.waitUntilLoadingFinishes();

        const urlDepartureTime = departureTime.replace(":", "") + "00";
        cy.assertJourneySelected("1018", urlDepartureTime);
      });
  });

  it("Can select a weekly departure", () => {
    // Go to the previous week
    cy.visit(`/?date=${oneWeekAgo}`);

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.getTestElement("sidebar-tab-journeys_by_week").click();
    cy.getTestElement("journeys-by-week-list").should("exist");

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("weekly-departure-time").should("have.length.least", 2);

    cy.getTestElement("weekly-departure-ok")
      .first()
      .click({force: true});

    cy.waitUntilLoadingFinishes();
    cy.assertJourneySelected("1018");
  });

  it("Can select a weekly departure in last stop arrival mode", () => {
    // Go to the previous week
    cy.visit(`/?date=${oneWeekAgo}`);

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.getTestElement("sidebar-tab-journeys_by_week").click();
    cy.getTestElement("journeys-by-week-list").should("exist");

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("weekly-departure-time")
      .should("have.length.least", 2)
      .first()
      .text()
      .as("first-departure-time");

    cy.getTestElement("observed-times-type-select").click();

    cy.waitUntil(
      () =>
        cy
          .getTestElement("weekly-departure-time")
          .first()
          .text()
          .then((lastStopArrival) =>
            cy
              .get("@first-departure-time")
              .then((firstStopDeparture) => lastStopArrival !== firstStopDeparture)
          ),
      {timeout: 120000}
    );

    cy.getTestElement("weekly-departure-time").should("have.length.least", 2);

    cy.getTestElement("weekly-departure-ok")
      .first()
      .click({force: true});

    cy.waitUntilLoadingFinishes();
    cy.assertJourneySelected("1018");
  });

  it("Can display the journey graph", () => {
    cy.visit(`/?date=${yesterday}`);

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("observed-journey")
      .first()
      .click();

    cy.waitUntilLoadingFinishes();

    cy.assertJourneySelected("1018");

    cy.getTestElement("toggle-graph-button")
      .should("exist")
      .click();

    cy.getTestElement("journey-graph-container").should("visible");
    cy.get(".test-class-journey-graph").should("exist");
  });
});
