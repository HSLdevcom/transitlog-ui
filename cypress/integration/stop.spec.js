describe("Stop smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Finds a stop and can select it", () => {
    cy.getTestElement("stop-input").type("1173434");
    cy.getTestElement("stop-option-1173434").click();

    cy.url().should((url) => expect(url).to.include(`stop=1173434`));

    cy.getTestElement("virtual-list").should("exist");
    cy.getTestElement("timetable-filters").should("exist");
    cy.getTestElement("departure-item").should("exist");
    cy.getTestElement("stop-popup-1173434").should("exist");
    cy.get(".test-class-stop-marker-1173434").should("exist");
  });
});
