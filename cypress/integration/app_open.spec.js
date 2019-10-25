describe("App opening smoke tests", () => {
  beforeEach(() => {
    cy.visit("/", {
      onBeforeLoad: (win) => {
        cy.spy(win.console, "error").as("consoleError");
      },
    });
  });

  it("Opens the app", () => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000); // Wait for the initial requests to finish

    cy.get("@consoleError", {timeout: 0}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );

    cy.contains("Reittiloki");
  });
});
