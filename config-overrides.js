/* config-overrides.js */

const {
  override,
  disableEsLint,
  addBabelPlugins,
} = require("customize-cra");
const {addReactRefresh} = require("customize-cra-react-refresh");

module.exports = override(
  // disable eslint in webpack
  disableEsLint(),

  // Add some babel plugins
  ...addBabelPlugins("polished", "styled-components"),

  // Add Fast Refresh
  addReactRefresh()
);
