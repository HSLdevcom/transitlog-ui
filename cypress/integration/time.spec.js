describe("Time and reset/update smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Can simulate time", () => {
    const yesterday /* All my troubles seem so far away */ = Cypress.moment().subtract(
      1,
      "day"
    );

    // Go to yesterday so that we don't trigger live-update here.
    cy.visit(`/?date=${yesterday.format("YYYY-MM-DD")}`);
    cy.clock(yesterday.valueOf());

    cy.getTestElement("time-input")
      .invoke("val")
      .as("start-time");

    cy.getTestElement("simulation-toggle").click();

    cy.tick(5000);

    cy.getTestElement("time-input")
      .invoke("val")
      .then((currentTime) => {
        cy.get("@start-time").should("not.equal", currentTime);
      });
  });

  it("Can use live mode", () => {
    cy.getTestElement("route-input", {timeout: 2000}).type("2510/1");
    cy.getTestElement("route-option-2510-1", {timeout: 2000}).click();

    cy.getTestElement("observed-journey")
      .last()
      .click();

    cy.assertJourneySelected("2510");

    // Clicking the vehicle marker will pin the tooltip
    cy.getTestElement("hfp-marker-icon").click();
    cy.getTestElement("hfp-tooltip-content").should("exist");

    cy.getTestElement("hfp-event-time")
      .text()
      .as("start-time");

    cy.getTestElement("simulation-toggle").click();

    cy.wait(5000);

    cy.getTestElement("hfp-event-time")
      .text()
      .then((currentTime) => {
        cy.get("@start-time").should("not.equal", currentTime);
      });

    cy.getTestElement("simulation-toggle").click();
  });
});
