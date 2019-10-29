// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

Cypress.Commands.add("getTestElement", (selector, options = {}) => {
  return cy.get(`[data-testid~="${selector}"]`, options);
});

Cypress.Commands.add("hslLogin", (overrides = {}) => {
  const AUTH_URI = Cypress.env("AUTH_URI");
  const REDIRECT_URI = Cypress.env("REDIRECT_URI");
  const CLIENT_ID = Cypress.env("CLIENT_ID");
  const SCOPE = Cypress.env("SCOPE");

  Cypress.log({
    name: "HSL ID login",
  });

  const options = {
    method: "POST",
    url: AUTH_URI,
    qs: {
      ns: "hsl-transitlog",
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      response_type: "code",
      scope: SCOPE,
      ui_locales: "en",
    },
    form: true, // we are submitting a regular form body
    body: {
      username: "jane.lane",
      password: "password123",
    },
  };

  // allow us to override defaults with passed in overrides
  _.extend(options, overrides);

  cy.request(options);
});

Cypress.Commands.add("assertRouteSelected", (routeId = "2510") => {
  cy.getTestElement("journey-details-header", {timeout: 60000}).contains(routeId);
  cy.get(".test-class-stop-marker", {timeout: 60000}).should("have.length.least", 2);
});

Cypress.Commands.add("assertJourneySelected", (routeId = "2510", departureTime) => {
  cy.assertRouteSelected(routeId);
  cy.getTestElement("journey-stop-event", {timeout: 60000}).should("exist");
  cy.getTestElement("date-input")
    .invoke("val")
    .then((selectedDate) => {
      const urlDate = selectedDate.replace(/-/g, "");

      if (departureTime) {
        cy.url().should("include", `/journey/${urlDate}/${departureTime}/${routeId}/1`);
      } else {
        cy.url().should("include", `/journey/${urlDate}`);
      }
    });
});
