describe("Authentication smoke tests", () => {
  it("Cannot see unauthorized elements when not logged in", () => {
    cy.visit("/");
    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });

  it("Can log in with HSL ID", () => {
    cy.hslLogin();
    cy.getTestElement("authenticated-user", {timeout: 10000}).should("exist");
  });
});
