describe("App opening smoke tests", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
    cy.window().then((win) => {
      cy.wrap(cy.spy(win.console, "error")).as("spyWinConsoleError");
    });
  });

  it("Opens the app", () => {
    cy.contains("Reittiloki");

    cy.wait(5000);

    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
    });
  });
});
