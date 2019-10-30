describe("Authentication smoke tests", () => {
  it("Cannot see unauthorized elements when not logged in", () => {
    cy.visit("/");
    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });

  it("Can log in with HSL ID", () => {
    cy.getCookie("transitlog-session").should("not.exist");

    cy.hslLogin();

    cy.getTestElement("authenticated-user").should("exist");
    cy.getTestElement("vehicle-search").should("exist");
    cy.getCookie("transitlog-session").should("exist");
  });

  it("Can log out", () => {
    cy.hslLogin();

    cy.wait(2000);

    cy.getTestElement("auth-modal-button").click();
    cy.getTestElement("logout-button")
      .should("exist")
      .click();

    cy.wait(5000);

    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });
});
