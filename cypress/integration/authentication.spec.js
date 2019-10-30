describe("Authentication smoke tests", () => {
  beforeEach(() => {});

  it("Cannot see unauthorized elements when not logged in", () => {
    cy.visit("/");
    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });

  it("Can log in with HSL ID", () => {
    cy.getCookie("transitlog-session").should("not.exist");

    cy.hslLogin();

    cy.getTestElement("authenticated-user", {timeout: 10000}).should("exist");
    cy.getTestElement("vehicle-search").should("not.exist");
    cy.getCookie("transitlog-session").should("exist");
  });

  it("Can log out", () => {
    cy.hslLogin();

    cy.getTestElement("auth-modal-button").click();
    cy.getTestElement("logout-button", {timeout: 10000})
      .should("exist")
      .click();

    // This is necessary waiting.
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });
});
