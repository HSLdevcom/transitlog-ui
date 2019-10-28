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
    const drawStart = {x: 830, y: 718};
    const drawEnd = {x: 841, y: 714};

    cy.getTestElement("time-input").type("8:00");
    cy.getTestElement("date-day-decrease").click();

    cy.get(".leaflet-draw-draw-rectangle").click();

    drawRectangle(drawStart, drawEnd);

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });

  it("Selects an area from URL bounds", () => {
    const currentDate = Cypress.moment().format("YYYY-MM-DD");

    cy.visit(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?areaBounds=24.93684053421021%2C60.16994130182097%2C24.938600063323975%2C60.17059215409059&time=08%3A00%3A00&date=${currentDate}`
    );

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });
});
