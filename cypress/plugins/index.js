const fs = require("fs-extra");
const path = require("path");
const _ = require("lodash");
const dotenv = require("dotenv");

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

async function getConfigurationByFile(file) {
  if (!file) {
    return {};
  }

  const pathToConfigFile = path.resolve(`cypress.${file}.json`);
  return fs.readJson(pathToConfigFile);
}

async function readEnvVars() {
  const config = {};

  const appRoot = await fs.realpath(process.cwd());
  const envPaths = [path.resolve(appRoot, ".env.cypress")];
  const envObjects = [];

  // Read env vars from file
  for (const envPath of envPaths) {
    const pathExists = await fs.exists(envPath);

    if (!pathExists) {
      continue;
    }

    const envFile = await fs.readFile(envPath, "utf8");
    const envContent = dotenv.parse(envFile);
    envObjects.push(envContent);
  }

  const combinedFiles = _.merge({}, ...envObjects);
  // Only include env vars that start with CYPRESS_
  const CYPRESS_PREFIX = /^CYPRESS_/i;

  // Add CYPRESS-prefixed vars to the config.
  Object.entries(combinedFiles).forEach(([key, value]) => {
    if (key.match(CYPRESS_PREFIX)) {
      const cypressKey = key.replace(CYPRESS_PREFIX, "");
      config[cypressKey] = value;
    }
  });

  // Add CYPRESS-prefixed vars from the environment to the config.
  for (const [envName, envValue] of Object.entries(process.env)) {
    if (envName.match(CYPRESS_PREFIX)) {
      const cypressKey = envName.replace(CYPRESS_PREFIX, "");
      config[cypressKey] = envValue;
    }
  }

  return config;
}

module.exports = async (on, config) => {
  const configFile = config.env.configFile || "";

  const envVars = await readEnvVars();
  const envConfig = await getConfigurationByFile(configFile);

  return _.merge({}, config, {env: envVars}, envConfig);
};
