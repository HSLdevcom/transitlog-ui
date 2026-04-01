import moment from "moment";

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

  // Time sim doesnt seem to be working in test environment, so skipping for now.
  /*
  it("Can simulate time", () => {
    const yesterday = moment().subtract(1, "day");

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
  });*/

  it("Can use live mode", () => {
    cy.getTestElement("route-input").type("1500/1");
    cy.getTestElement("route-option-1500-1").click({ force: true });

    cy.getTestElement("observed-journey")
      .last()
      .click({ force: true });

    cy.assertJourneySelected("1500");

    cy.getTestElement("hfp-marker-icon").click({ force: true });
    cy.getTestElement("hfp-tooltip-content").should("exist");

    cy.getTestElement("hfp-event-time")
      .invoke("text")
      .then((startTime) => {
        cy.getTestElement("simulation-toggle").click({ force: true });

        cy.getTestElement("hfp-event-time", { timeout: 15000 })
          .invoke("text")
          .should((currentTime) => {
            expect(currentTime).to.not.equal(startTime);
          });
      });

    cy.getTestElement("simulation-toggle").click({ force: true });
  });
});
