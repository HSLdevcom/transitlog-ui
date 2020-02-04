describe("App opening smoke tests", () => {
  beforeEach(() => {
    cy.visitAndSpy("/");
  });

  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
  });

  it("Opens the app", () => {
    cy.contains("Reittiloki");
  });

  it("Has the date in the URL", () => {
    const currentDate = Cypress.moment().format("YYYY-MM-DD");
    cy.url().should((url) => expect(url).to.include(`date=${currentDate}`));
  });

  it("Can switch languages", () => {
    cy.getTestElement("select-lang-en").click();
    cy.url().should("include", `language=en`);
    cy.getTestElement("date-label")
      .text()
      .should("equal", "Choose date and time");

    cy.getTestElement("select-lang-se").click();
    cy.url().should("include", `language=se`);
    cy.getTestElement("date-label")
      .text()
      .should("equal", "Välj datum och tid");

    cy.getTestElement("select-lang-fi").click();
    cy.url().should("include", `language=fi`);
    cy.getTestElement("date-label")
      .text()
      .should("equal", "Valitse päivä ja aika");
  });

  it("Can share the view", () => {
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("route-input").type("2510/1");
    cy.getTestElement("route-option-2510-1").click();

    cy.getTestElement("stop-input").type("1173434");
    cy.getTestElement("stop-option-1173434").click();

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("share-button").click();
    cy.getTestElement("share-url-display")
      .should("exist")
      .invoke("val")
      .then((shareUrl) => {
        const sameOriginShare = shareUrl.substring(shareUrl.indexOf("?") - 1);

        cy.visit(sameOriginShare);

        cy.getTestElement("route-input")
          .invoke("val")
          .should("equal", "2510/1");

        cy.getTestElement("stop-input")
          .invoke("val")
          .should("equal", "1173434");
      });
  });

  it("Can reset the app", () => {
    cy.getTestElement("route-input").type("2510/1");
    cy.getTestElement("route-option-2510-1").click();

    cy.getTestElement("stop-input").type("1173434");
    cy.getTestElement("stop-option-1173434").click();

    cy.waitUntilLoadingFinishes();

    cy.getTestElement("reset-button").click();

    cy.getTestElement("route-input").should("be.empty");
    cy.getTestElement("stop-input").should("be.empty");
  });
});
