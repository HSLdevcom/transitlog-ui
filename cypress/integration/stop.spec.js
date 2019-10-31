describe("Stop smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
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
    cy.visit("/?mapZoom=14");

    cy.get(".test-class-stop-marker").should("have.length.least", 2);
    cy.get(".test-class-stop-marker-1010115").click();

    cy.getTestElement("stop-input")
      .invoke("val")
      .should("equal", "1010115");
  });
});
