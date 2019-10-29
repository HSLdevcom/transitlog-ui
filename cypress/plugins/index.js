const fs = require("fs");
const path = require("path");

// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

module.exports = (on, config) => {
  const appRoot = fs.realpathSync(process.cwd());
  // TODO: Read env config for current env instead of hardcoded values.
  const envPaths = [
    path.resolve(appRoot, ".env.cypress"),
    path.resolve(appRoot, ".testsecret"),
  ];

  // Read env config
  envPaths.forEach((envPath) => {
    if (!fs.existsSync(envPath)) {
      throw new Error(
        "Auth secrets for testing not found! Ensure a `.testsecret` file exists in the project root containing the client secret."
      );
    }

    require("dotenv-expand")(
      require("dotenv").config({
        path: envPath,
      })
    );
  });

  const REACT_APP = /^REACT_APP_/i;

  // Add react app env vars to Cypress config.
  Object.entries(process.env).forEach(([key, value]) => {
    const cypressKey = key.replace(REACT_APP, "");
    config.env[cypressKey] = value;
  });

  return config;
};
