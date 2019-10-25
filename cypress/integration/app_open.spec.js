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
    cy.wait(3000); // Wait for the initial requests to finish

    cy.get("@consoleError", {timeout: 1}).should((errorLog) =>
      expect(errorLog).to.have.callCount(0)
    );

    cy.contains("Reittiloki");
  });

  it("Has the date in the URL", () => {
    const currentDate = Cypress.moment().format("YYYY-MM-DD");
    cy.url().should((url) => expect(url).to.include(`date=${currentDate}`));
  });
});
