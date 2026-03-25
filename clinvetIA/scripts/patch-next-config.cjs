/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
/* eslint-enable @typescript-eslint/no-require-imports */

const target = path.join(__dirname, "..", "node_modules", "next", "config.js");

const content = `function getConfig() {
  return { publicRuntimeConfig: {}, serverRuntimeConfig: {} };
  }

  module.exports = getConfig;
  module.exports.default = getConfig;
`;

try {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content, "utf8");
  console.log("[patch-next-config] wrote", target);
} catch (error) {
  console.error("[patch-next-config] failed", error);
  process.exitCode = 1;
}
