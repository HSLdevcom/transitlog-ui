describe("Vehicles smoke tests", () => {
  beforeEach(() => {
    cy.hslLogin();
  });

  it("Can search for a vehicle", () => {
    cy.getTestElement("vehicle-search").should("exist");
    cy.getTestElement("vehicle-search-input")
      .should("exist")
      .type("0012/1001");

    cy.getTestElement("vehicle-option")
      .first()
      .click();

    cy.getTestElement("vehicle-block-list").should("exist");
    cy.getTestElement("selected-vehicle-display").should("exist");
  });

  it("Can select vehicle departure", () => {
    cy.getTestElement("vehicle-search").should("exist");
    cy.getTestElement("vehicle-search-input")
      .should("exist")
      .focus();

    cy.getTestElement("vehicle-option-in-service")
      .first()
      .click();

    cy.getTestElement("vehicle-block-list").should("exist");
    cy.getTestElement("vehicle-departure-option")
      .first()
      .click();

    cy.assertJourneySelected();
  });
});
