describe("Vehicles smoke tests", () => {
  beforeEach(() => {
    cy.hslLogin();
  });

  it("Can search for a vehicle", () => {
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("vehicle-search").should("exist");
    cy.getTestElement("vehicle-search-input")
      .should("exist")
      .focus();

    cy.getTestElement("vehicle-option-label")
      .first()
      .text()
      .then((vehicleId) => {
        cy.getTestElement("vehicle-search-input").type(vehicleId);

        cy.getTestElement("vehicle-option")
          .first()
          .click();

        cy.waitUntilLoadingFinishes();

        cy.getTestElement("vehicle-block-list").should("exist");
        cy.getTestElement("selected-vehicle-display").should("exist");
      });
  });

  it("Can select vehicle departure", () => {
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("vehicle-search").should("exist");
    cy.getTestElement("vehicle-search-input")
      .should("exist")
      .focus();

    cy.getTestElement("vehicle-option-in-service")
      .first()
      .click();

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("vehicle-block-list").should("exist");
    cy.getTestElement("vehicle-departure-option")
      .first()
      .click();

    cy.waitUntilLoadingFinishes();
    cy.assertJourneySelected();
  });
});
