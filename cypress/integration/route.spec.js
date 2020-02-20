describe("Route smoke tests", () => {
  // Yesterday's data is kept in cache for longer which make the tests faster.
  const yesterday = Cypress.moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
  });

  it("Finds a route and can select it", () => {
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.url().should((url) =>
      expect(url).to.include(`route.routeId=1018&route.direction=1`)
    );

    cy.getTestElement("journey-list").should("exist");
    cy.assertRouteSelected("1018");
  });

  it("Selects a journey of the route", () => {
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.getTestElement("observed-journey")
      .first()
      .click()
      .find(`[data-testid="journey-departure-time"]`)
      .text()
      .then((departureTime) => {
        const urlDepartureTime = departureTime.replace(":", "") + "00";
        cy.assertJourneySelected("1018", urlDepartureTime);
      });
  });

  it("Can select a weekly departure", () => {
    // Go to the previous week
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("sidebar-tab-week-journeys").click();
    cy.getTestElement("journeys-by-week-list").should("exist");

    cy.getTestElement("weekly-departure-time").should("have.length.least", 2);

    cy.getTestElement("weekly-departure-ok")
      .first()
      .click({force: true});

    cy.assertJourneySelected("1018");
  });

  it("Can select a weekly departure in last stop arrival mode", () => {
    // Go to the previous week
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("sidebar-tab-week-journeys").click();
    cy.getTestElement("journeys-by-week-list").should("exist");

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

    cy.assertJourneySelected("1018");
  });

  it("Can display the journey graph", () => {
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1018/1");
    cy.getTestElement("route-option-1018-1").click();

    cy.getTestElement("observed-journey")
      .first()
      .click();

    cy.assertJourneySelected("1018");

    cy.getTestElement("toggle-graph-button")
      .should("exist")
      .click();

    cy.getTestElement("journey-graph-container").should("visible");
    cy.get(".test-class-journey-graph").should("exist");
  });
});
