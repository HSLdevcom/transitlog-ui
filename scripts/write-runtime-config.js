const fs = require("fs");
const path = require("path");

const out = path.resolve(process.cwd(), "build", "config.js");

const keys = [
  "REACT_APP_ENV_NAME",
  "REACT_APP_TRANSITLOG_SERVER",
  "REACT_APP_TRANSITLOG_SERVER_GRAPHQL",
  "REACT_APP_TRANSITLOG",
  "REACT_APP_AUTH_URI",
  "REACT_APP_REDIRECT_URI",
  "REACT_APP_AUTH_SCOPE",
  "REACT_APP_ALLOW_DEV_LOGIN",
  "REACT_APP_PRODUCTION_URL",
  "REACT_APP_TIMEZONE",
  "REACT_APP_DIGITRANSIT_URL",
];

const cfg = {};
for (const k of keys) {
  if (process.env[k] !== undefined) cfg[k] = process.env[k];
}

fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, `window.__CONFIG__ = ${JSON.stringify(cfg, null, 2)};\n`, "utf8");

console.log("Wrote runtime config to", out);
