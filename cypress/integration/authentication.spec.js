describe("Authentication smoke tests", () => {
  beforeEach(() => {
    cy.visitAndSpy("/");
  });

  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
  });

  it("Cannot see unauthorized elements when not logged in", () => {
    cy.visitAndSpy("/");
    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });

  it("Can log in with HSL ID", () => {
    cy.hslLogin();

    cy.getTestElement("authenticated-user").should("exist");
    cy.getTestElement("vehicle-search").should("exist");
    cy.getCookie("transitlog-session").should("exist");
  });

  it("Can log out", () => {
    cy.hslLogin();

    cy.getTestElement("auth-modal-button").click();
    cy.getTestElement("logout-button")
      .should("exist")
      .click();

    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });
});
