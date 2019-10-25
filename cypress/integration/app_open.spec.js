describe("App opening smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");

    cy.window().then((win) => {
      cy.spy(win.console, "error");
    });
  });

  it("Opens the app", () => {
    cy.contains("Reittiloki");

    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(5000);

    cy.window().then((win) => {
      expect(win.console.error).to.have.callCount(0);
    });
  });
});
