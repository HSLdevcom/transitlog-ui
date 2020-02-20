/* config-overrides.js */

const {
  override,
  addDecoratorsLegacy,
  disableEsLint,
  addBabelPlugins,
} = require("customize-cra");
const {addReactRefresh} = require("customize-cra-react-refresh");

module.exports = override(
  // enable legacy decorators babel plugin
  addDecoratorsLegacy(),

  // disable eslint in webpack
  disableEsLint(),

  // Add some babel plugins
  ...addBabelPlugins("polished", "styled-components"),

  // Add Fast Refresh
  addReactRefresh({disableRefreshCheck: true})
);
