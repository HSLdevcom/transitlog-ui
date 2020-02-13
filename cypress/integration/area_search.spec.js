describe("Area search", () => {
  const yesterday = Cypress.moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  beforeEach(() => {
    cy.visitAndSpy("/");
  });

  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
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

    cy.getTestElement("time-input").type("08:00");
    cy.getTestElement("date-day-decrease").click();

    cy.get(".leaflet-draw-draw-rectangle").click();

    drawRectangle(drawStart, drawEnd);

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });

  it("Selects an area from URL bounds", () => {
    cy.visitAndSpy(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?selectedBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=09%3A00%3A00&date=${yesterday}`
    );

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });

  it("Selects a journey from the area results", () => {
    cy.visitAndSpy(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?selectedBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=09%3A00%3A00&date=${yesterday}`
    );

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("area-journey-item-journey")
      .first()
      .click();

    cy.getTestElement("sidebar-tab-journeys").should("exist");
    cy.getTestElement("journey-details").should("exist");

    cy.assertJourneySelected();
  });
});
