describe("Time smoke tests", () => {
  beforeEach(() => {
    cy.visitAndSpy("/");
  });

  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
  });

  it("Can select a time", () => {
    cy.getTestElement("time-input")
      .clear()
      .type("8")
      .blur();

    cy.getTestElement("current-time")
      .text()
      .should("equal", "08:00:00");

    cy.getTestElement("time-input")
      .clear()
      .type("12:30:40");

    cy.getTestElement("current-time")
      .text()
      .should("equal", "08:00:00");

    cy.getTestElement("time-input").blur();

    cy.getTestElement("current-time")
      .text()
      .should("equal", "12:30:40");
  });

  it("Can simulate time", () => {
    const yesterday = Cypress.moment().subtract(1, "day");

    // Go to yesterday so that we don't trigger live-update here.
    cy.visitAndSpy(`/?date=${yesterday.format("YYYY-MM-DD")}`);
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
    cy.getTestElement("route-input").type("2550/1");
    cy.getTestElement("route-option-2550-1").click();

    cy.getTestElement("observed-journey")
      .eq(-1)
      .click();

    cy.assertJourneySelected("2550");

    // Clicking the vehicle marker will pin the tooltip
    cy.getTestElement("hfp-marker-icon").click();
    cy.getTestElement("hfp-tooltip-content").should("exist");

    cy.getTestElement("hfp-event-time")
      .text()
      .as("start-time");

    cy.getTestElement("simulation-toggle").click();

    cy.wait(5000, {timeout: 6000});

    cy.getTestElement("hfp-event-time")
      .text()
      .then((currentTime) => {
        cy.get("@start-time").should("not.equal", currentTime);
      });

    cy.getTestElement("simulation-toggle").click();
  });
});
