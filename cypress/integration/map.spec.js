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
    cy.url().should("include", "Stop+radius");

    cy.get(".test-class-stop-radius")
      .should("exist")
      .then((stopRadiusElements) => {
        const count = stopRadiusElements.length;
        cy.get(".test-class-stop-marker").should("have.length", count);
      });
  });

  it("Can display Mapillary coverage", () => {
    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Mapillary").click();
    cy.url().should("include", "Mapillary");

    cy.get(".leaflet-mapillary-lines-pane", {timeout: 60000})
      .children()
      .should("exist");
  });

  it("Can display the weather", () => {
    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Weather").click();
    cy.url().should("include", "Weather");

    cy.get(".test-class-weather-marker").should("exist");
    cy.getTestElement("weather-widget").should("exist");
  });

  it("Can display where vehicles stood still", () => {
    // This won't actually test the "vehicle stopped here" marker
    // as we can't know which journeys will trigger it. This
    // tests that we can select it in the layer select.
    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Stopped vehicle")
      .click()
      .click(); // it is selected by default so clicking it once will deselect it.

    cy.url().should("include", "Stopped+vehicle");
  });
});
