describe("Stop smoke tests", () => {
  beforeEach(() => {
    cy.visitAndSpy("/");
  });

  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
  });

  it("Finds a stop and can select it", () => {
    cy.getTestElement("stop-input").type("1173434");
    cy.getTestElement("stop-option-1173434").click();

    cy.url().should((url) => expect(url).to.include(`stop=1173434`));

    cy.getTestElement("stop-departures-list").should("exist");
    cy.getTestElement("timetable-filters").should("exist");
    cy.getTestElement("departure-item").should("exist");
    cy.getTestElement("stop-popup-1173434").should("exist");
    cy.get(".test-class-stop-marker-1173434").should("exist");
  });

  it("Can select a departure", () => {
    cy.getTestElement("stop-input").type("1173434");
    cy.getTestElement("stop-option-1173434").click();

    cy.getTestElement("departure-option")
      .first()
      .click();

    cy.assertJourneySelected();
  });

  it("Can select a stop from the map", () => {
    cy.visitAndSpy("/?mapZoom=14");

    cy.get(".test-class-stop-marker").should("have.length.least", 2);
    cy.get(".test-class-stop-marker-1010115").click();

    cy.getTestElement("stop-input")
      .invoke("val")
      .should("equal", "1010115");
  });

  it("Finds a terminal and can select it", () => {
    cy.getTestElement("stop-input").type("1000002");
    cy.getTestElement("terminal-option-1000002").click();

    cy.url().should((url) => expect(url).to.include(`terminal=1000002`));

    cy.getTestElement("stop-departures-list").should("exist");
    cy.getTestElement("timetable-filters").should("exist");
    cy.getTestElement("departure-item").should("exist");
    cy.getTestElement("terminal-popup-1000002").should("exist");
    cy.getTestElement("terminal-marker-1000002").should("exist");
  });
});
