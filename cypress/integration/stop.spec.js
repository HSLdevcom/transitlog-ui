describe("Stop smoke tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.getTestElement("select-lang-fi");
  });

  it("Finds a stop and can select it", () => {
    cy.getTestElement("stop-input").type("1173434");
    cy.getTestElement("stop-option-1173434").click();

    cy.url().should((url) => expect(url).to.include(`stop=1173434`));

    cy.getTestElement("virtual-list").should("ok");
    cy.getTestElement("timetable-filters").should("ok");
    cy.getTestElement("stop-popup-1173434").should("ok");
  });
});
