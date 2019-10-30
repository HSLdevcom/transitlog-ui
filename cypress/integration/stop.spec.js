describe("Stop smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getTestElement("stop-input", {timeout: 3000}).type("1173434");
    cy.getTestElement("stop-option-1173434").click();
  });

  it("Finds a stop and can select it", () => {
    cy.url().should((url) => expect(url).to.include(`stop=1173434`));

    cy.getTestElement("stop-departures-list").should("exist");
    cy.getTestElement("timetable-filters").should("exist");
    cy.getTestElement("departure-item").should("exist");
    cy.getTestElement("stop-popup-1173434").should("exist");
    cy.get(".test-class-stop-marker-1173434").should("exist");
  });

  it("Can select a departure", () => {
    cy.getTestElement("departure-option")
      .first()
      .click();

    cy.assertJourneySelected();
  });
});
