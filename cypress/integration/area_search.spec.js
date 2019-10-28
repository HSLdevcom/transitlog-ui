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

    cy.get(".leaflet-draw-draw-rectangle").click();

    drawRectangle(drawStart, drawEnd);

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });

  it("Selects an area from URL bounds", () => {
    const yesterday = Cypress.moment()
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    cy.visit(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?areaBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=08%3A00%3A00&date=${yesterday}`
    );

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });

  it("Selects a journey from the area results", () => {
    const yesterday = Cypress.moment()
      .subtract(1, "day")
      .format("YYYY-MM-DD");

    cy.visit(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?areaBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=08%3A00%3A00&date=${yesterday}`
    );

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("area-journey-item-journey", {timeout: 10000}) // Select actual journeys and not deadruns
      .first()
      .click();

    cy.getTestElement("sidebar-tab-journeys").should("exist");
    cy.getTestElement("journey-details").should("exist");
    cy.getTestElement("journey-stop-event", {timeout: 10000}).should("exist");
    cy.get(".test-class-stop-marker").should("have.length.least", 2);

    cy.url().should("include", `/journey/${yesterday.replace(/-/g, "")}`);
  });
});
