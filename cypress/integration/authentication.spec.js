describe("Authentication smoke tests", () => {
  it("Cannot see unauthorized elements when not logged in", () => {
    cy.visit("/");
    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });

  it("Can log in with HSL ID", () => {
    cy.hslLogin();

    cy.getTestElement("authenticated-user").should("exist");
  
    cy.waitUntilLoadingFinishes();
    
    cy.getTestElement("vehicle-search").should("exist");
    cy.getCookie("transitlog-session").should("exist");
  });

  it("Can log out", () => {
    cy.hslLogin();
  
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("auth-modal-button").click();
    cy.getTestElement("logout-button")
      .should("exist")
      .click();
  
    cy.waitUntilLoadingFinishes();

    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });
});
