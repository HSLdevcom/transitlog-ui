describe("Area search", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  function drawRectangle(from, to) {
    cy.get(`.leaflet-container`)
      .trigger("mousedown", {which: 1, clientX: from.x, clientY: from.y})
      .trigger("mousemove", {clientX: to.x, clientY: to.y})
      .trigger("mouseup", {force: true});
  }

  it("Selects an area by drawing", () => {
    const drawStart = {x: 834, y: 712};
    const drawEnd = {x: 844, y: 722};

    cy.getTestElement("time-input").type("8:00");
    cy.getTestElement("date-day-decrease").click();
  
    cy.waitUntilLoadingFinishes();

    cy.get(".leaflet-draw-draw-rectangle").click();

    drawRectangle(drawStart, drawEnd);
  
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });

  it("Selects an area from URL bounds", () => {
    const yesterday = Cypress.moment()
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    cy.visit(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?selectedBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=08%3A00%3A00&date=${yesterday}`
    );
  
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });

  it("Selects a journey from the area results", () => {
    const yesterday = Cypress.moment()
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    cy.visit(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?selectedBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=08%3A00%3A00&date=${yesterday}`
    );
  
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("area-journey-item-journey", {timeout: 60000})
      .first()
      .click();
  
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("sidebar-tab-journeys").should("exist");
    cy.getTestElement("journey-details").should("exist");

    cy.assertJourneySelected();
  });
});
