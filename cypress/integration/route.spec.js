describe("Route smoke tests", () => {
  const yesterday = Cypress.moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  function assertRouteSelected() {
    cy.getTestElement("journey-details-header", {timeout: 60000}).contains("2510");
    cy.get(".test-class-stop-marker", {timeout: 60000}).should("have.length.least", 2);
  }

  function assertJourneySelected(departureTime) {
    assertRouteSelected();
    cy.getTestElement("journey-stop-event", {timeout: 60000}).should("exist");
    cy.getTestElement("date-input")
      .invoke("val")
      .then((selectedDate) => {
        const urlDate = selectedDate.replace(/-/g, "");

        if (departureTime) {
          cy.url().should("include", `/journey/${urlDate}/${departureTime}/2510/1`);
        } else {
          cy.url().should("include", `/journey/${urlDate}`);
        }
      });
  }

  beforeEach(() => {
    cy.visit(`/?date=${yesterday}`);
    cy.getTestElement("route-input", {timeout: 2000}).type("2510/1");
    cy.getTestElement("route-option-2510-1", {timeout: 2000}).click();
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
    cy.getTestElement("weekly-departure-time", {timeout: 20000}).should(
      "have.length.least",
      2
    );

    cy.getTestElement("weekly-departure-ok", {timeout: 10000})
      .first()
      .click({force: true});

    assertJourneySelected();
  });

  it("Can select a weekly departure in last stop arrival mode", () => {
    cy.getTestElement("sidebar-tab-journeys_by_week").click();
    cy.getTestElement("journeys-by-week-list").should("exist");
    cy.getTestElement("weekly-departure-time", {timeout: 20000})
      .should("have.length.least", 2)
      .first()
      .text()
      .as("first-departure-time");

    cy.getTestElement("observed-times-type-select").click();

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTestElement("weekly-departure-time", {timeout: 10000}).should(
      "have.length.least",
      2
    );

    cy.getTestElement("weekly-departure-time", {timeout: 10000})
      .first()
      .text()
      .then((lastStopArrival) => {
        cy.get("@first-departure-time").should("not.equal", lastStopArrival);
      });

    cy.getTestElement("weekly-departure-ok", {timeout: 10000})
      .first()
      .click({force: true});

    assertJourneySelected();
  });
});
