describe("Instructions smoke test", () => {
  beforeEach(() => {
    cy.visitAndSpy("/");
  });
  
  afterEach(() => {
    cy.get("@consoleError", {timeout: 1000}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );
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
