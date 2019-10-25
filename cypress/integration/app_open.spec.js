describe("App opening smoke tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.window().then((win) => {
      cy.wrap(cy.spy(win.console, "error")).as("spyWinConsoleError");
    });
  });

  it("Opens the app", () => {
    cy.contains("Reittiloki");

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    expect(cy.get("spyWinConsoleError")).to.have.callCount(0);
  });
});
