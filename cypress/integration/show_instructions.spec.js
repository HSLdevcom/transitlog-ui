describe("Instructions smoke test", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("Can open instructions", () => {
    cy.getTestElement("open-instructions").click();
    cy.getTestElement("usage-instructions").should("exist");
  });

  it("Can close instructions", () => {
    cy.getTestElement("open-instructions").click();
    cy.getTestElement("open-instructions").click();
    cy.getTestElement("usage-instructions").should("not.exist");
  });
});
