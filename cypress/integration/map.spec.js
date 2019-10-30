describe("Map smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Can change between base maps", () => {
    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Aerial").click();
    cy.url().should("include", `mapBaseLayer=Aerial`);
    cy.contains(
      "© Espoon, Helsingin ja Vantaan kauupungit, Kirkkonummen ja Nurmijärven kunnat sekä HSL ja HSY"
    );

    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Digitransit").click();
    cy.url().should("include", `mapBaseLayer=Digitransit`);
    cy.contains("Map data © OpenStreetMap contributors ");
  });

  it("Can display stop radiuses", () => {
    cy.visit("/?mapZoom=15");
    cy.get(".test-class-stop-marker").should("have.length.least", 2);
    cy.get(".test-class-stop-radius").should("not.exist");

    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Stop radius").click();

    cy.get(".test-class-stop-radius")
      .should("exist")
      .then((stopRadiusElements) => {
        const count = stopRadiusElements.length;
        cy.get(".test-class-stop-marker").should("have.length", count);
      });
  });
});
