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

const _ = require("lodash");

Cypress.Commands.add("getTestElement", (selector, options = {}) => {
  return cy.get(`[data-testid~="${selector}"]`, options);
});

Cypress.Commands.add("hslLogin", (overrides = {}) => {
  const AUTH_URI = Cypress.env("AUTH_URI");
  const CLIENT_ID = Cypress.env("CLIENT_ID");
  const CLIENT_SECRET = Cypress.env("CLIENT_SECRET");
  const AUTH_SCOPE = Cypress.env("AUTH_SCOPE");
  const HSL_TESTING_HSLID_USERNAME = Cypress.env("HSL_TESTING_HSLID_USERNAME");
  const HSL_TESTING_HSLID_PASSWORD = Cypress.env("HSL_TESTING_HSLID_PASSWORD");

  const authHeader = `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`;

  Cypress.log({
    name: "HSL ID login",
  });

  const options = {
    method: "POST",
    url: AUTH_URI,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    form: true, // we are submitting a regular form body
    body: {
      scope: AUTH_SCOPE,
      grant_type: "password",
      username: HSL_TESTING_HSLID_USERNAME,
      password: HSL_TESTING_HSLID_PASSWORD,
    },
  };

  // allow us to override defaults with passed in overrides
  _.extend(options, overrides);

  cy.request(options).then((response) => {
    const {access_token} = response.body;

    expect(response.status).to.eq(200);
    expect(access_token).to.be.ok;
    cy.visit(`/?code=${access_token}&is_test=true`);
  });
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
