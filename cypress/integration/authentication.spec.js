describe("Authentication smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Cannot see unauthorized elements when not logged in", () => {
    cy.getTestElement("authenticated-user").should("not.exist");
    cy.getTestElement("vehicle-search").should("not.exist");
  });
  
  it("Can log in with HSL ID", () => {
  
  })
});
