const { defineConfig } = require('cypress')

const envName = process.env.configFile || 'local'

const baseUrls = {
  local: 'http://localhost:3000',
  dev: 'https://dev.reittiloki.hsldev.com',
  production: 'https://reittiloki.hsldev.com',
}

module.exports = defineConfig({
    
  e2e: {
    specPattern: 'cypress/e2e/**/*.js',
    supportFile: 'cypress/support/e2e.js',
    baseUrl: baseUrls[envName] || baseUrls.local,
    setupNodeEvents(on, config) {
        return config
    },
  },

  retries: {
    runMode: 2,
  },
  viewportWidth: 1366,
  viewportHeight: 1200,
  watchForFileChanges: false,
  defaultCommandTimeout: 240000,
  pageLoadTimeout: 180000,
  numTestsKeptInMemory: 10,

  env: {
    AUTH_URI: 'https://hslid-dev.t5.fi/openid/token',
    AUTH_SCOPE: 'email https://oneportal.trivore.com/scope/groups.readonly',
  },

  projectId: 'kz38w3',
})