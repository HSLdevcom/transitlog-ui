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

    cy.getTestElement("route-input").type("1024/1");
    cy.getTestElement("route-option-1024-1").click({force: true});

    cy.url().should((url) =>
      expect(url).to.include(`route.routeId=1024&route.direction=1`)
    );

    cy.getTestElement("journey-list").should("exist");
    cy.assertRouteSelected("1024");
  });

  it("Selects a journey of the route", () => {
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1024/1");
    cy.getTestElement("route-option-1024-1").click({force: true});

    cy.getTestElement("observed-journey")
      .first()
      .as("first-observed-journey");

    cy.get("@first-observed-journey").click({force: true});

    cy.get("@first-observed-journey")
      .find(`[data-testid="journey-departure-time"]`)
      .text()
      .then((departureTime) => {
        const urlDepartureTime = departureTime.replace(":", "") + "00";
        cy.assertJourneySelected("1024", urlDepartureTime);
      });
  });

  it("Can select a weekly departure", () => {
    // Go to the previous week
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1024/1");
    cy.getTestElement("route-option-1024-1").click({force: true});

    cy.getTestElement("sidebar-tab-week-journeys").click({force: true});
    cy.getTestElement("journeys-by-week-list").should("exist");

    cy.getTestElement("weekly-departure-time").should("have.length.least", 2);

    cy.getTestElement("weekly-departure-ok")
      .first()
      .click({force: true});

    cy.assertJourneySelected("1024");
  });

  it("Can select a weekly departure in last stop arrival mode", () => {
    // Go to the previous week
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1024/1");
    cy.getTestElement("route-option-1024-1").click({force: true});

    cy.getTestElement("sidebar-tab-week-journeys").click({force: true});
    cy.getTestElement("journeys-by-week-list").should("exist");

    cy.getTestElement("weekly-departure-time")
      .should("have.length.least", 2)
      .first()
      .text()
      .as("first-departure-time");

    cy.getTestElement("observed-times-type-select").click({force: true});

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
      {timeout: 480000}
    );

    cy.getTestElement("weekly-departure-time").should("have.length.least", 2);

    cy.getTestElement("weekly-departure-ok")
      .first()
      .click({force: true});

    cy.assertJourneySelected("1024");
  });

  it("Can display the journey graph", () => {
    cy.visitAndSpy(`/?date=${yesterday}`);

    cy.getTestElement("route-input").type("1024/1");
    cy.getTestElement("route-option-1024-1").click({force: true});

    cy.waitUntil(() =>
      cy
        .getTestElement("observed-journey")
        .first()
        .click({force: true})
    );

    cy.assertJourneySelected("1024");

    cy.getTestElement("toggle-graph-button")
      .should("exist")
      .click({force: true});

    cy.getTestElement("journey-graph-container").should("visible");
    cy.get(".test-class-journey-graph").should("exist");
  });
});
