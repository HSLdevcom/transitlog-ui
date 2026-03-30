describe("Map smoke tests", () => {
  beforeEach(() => {
    cy.visitAndSpy("/");
  });

  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
  });

  it("Can change between base maps", () => {
    cy.get(".leaflet-control-layers").invoke("show");
    cy.get('.leaflet-control-layers')
      .contains('label', 'Aerial')
      .find('input[type="radio"]')
      .check({ force: true });
    cy.get('.leaflet-control-layers')
      .contains('label', 'Aerial')
      .click({ force: true });
    cy.url().should("include", `mapBaseLayer=Aerial`);
    cy.contains(
      "© Espoon, Helsingin ja Vantaan kaupungit, Kirkkonummen ja Nurmijärven kunnat sekä HSL ja HSY"
    );

    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Digitransit").click();
    cy.url().should("include", `mapBaseLayer=Digitransit`);
    cy.contains("Map data © OpenStreetMap contributors ");
  });

  it("Can display stop radiuses", () => {
    cy.visit("/?mapZoom=15");

    cy.get(".test-class-stop-marker").should(($els) => {
      expect($els.length).to.be.at.least(2);
    });

    cy.get(".test-class-stop-radius").should("not.exist");

    cy.get(".leaflet-control-layers").trigger("mouseenter");

    cy.get(".leaflet-control-layers")
      .contains("label", "Stop radius")
      .find('input[type="checkbox"]')
      .as("stopRadiusCheckbox");

    cy.get("@stopRadiusCheckbox").should("not.be.checked");

    cy.get("@stopRadiusCheckbox").check({ force: true });
    cy.get("@stopRadiusCheckbox").check({ force: true });
    cy.get("@stopRadiusCheckbox").should("be.checked");

    cy.url().should("include", "Stop+radius");

    cy.get(".test-class-stop-radius")
      .should("exist")
      .then((stopRadiusElements) => {
        const count = stopRadiusElements.length;
        cy.get(".test-class-stop-marker").should("have.length", count);
      });
  });

  it("Can display the weather", () => {
    cy.get(".leaflet-control-layers").trigger("mouseover");
    cy.contains("Weather").click();
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
    cy.contains("Stopped vehicle").click();
    cy.contains("Stopped vehicle").click();
    cy.contains("Stopped vehicle").click();
    cy.url().should("include", "Stopped+vehicle");
  });
});
