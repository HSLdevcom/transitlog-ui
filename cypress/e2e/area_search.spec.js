import moment from "moment";

describe("Area search", () => {
  const yesterday = moment()
    .subtract(1, "day")
    .format("YYYY-MM-DD");

  beforeEach(() => {
    cy.visitAndSpy("/");
  });

  afterEach(() => {
    cy.get("@consoleError", {timeout: 5000}).should((errorLog) =>
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

    cy.getTestElement("hfp-area-button").click();

    drawRectangle(drawStart, drawEnd);

    cy.getTestElement("area-journeys-list").should("exist");

    cy.getTestElement("area-journey-item-journey")
      .should("have.length.at.least", 1)
      .first()
      .should("be.visible")
      .click({ force: true });
    cy.getTestElement("hfp-area-cancel-button").should("exist");
  });

  // Bugged. Ticket number 78845
  /* 
  it("Selects an area from URL bounds", () => {
    cy.visitAndSpy(
      // Select an area in front of Lasipalatsi in Helsinki at 8:00
      `/?selectedBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=09%3A00%3A00&date=${yesterday}`
    );

    cy.getTestElement("area-journeys-list").should("exist");
    cy.getTestElement("cancel-area-search-button").should("exist");
  });*/

  it("Selects a journey from the area results", () => {
    cy.visitAndSpy(
      `/?selectedBounds=24.93656158447266%2C60.16976407053985%2C24.93827819824219%2C60.17061760538285&time=09%3A00%3A00&date=${yesterday}`
    );

    cy.getTestElement("area-journeys-list").should("exist");

    cy.getTestElement("area-journey-item-journey").should(($items) => {
      expect($items.length).to.be.at.least(1);
    });

    cy.getTestElement("area-journey-item-journey")
      .first()
      .should("be.visible")
      .click({ force: true });

    cy.getTestElement("sidebar-tab-journeys").should("exist");
    cy.getTestElement("journey-details").should("exist");

    cy.assertJourneySelected();
  });
});
