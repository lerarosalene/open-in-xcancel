const p = require("node:path");
const fs = require("node:fs");
const esbuild = require("esbuild");
const Header = require("userscript-header-format");

const fsp = fs.promises;

async function main() {
  const packageData = JSON.parse(await fsp.readFile("package.json", "utf-8"));
  const header = {
    name: "[Twitter] Open in XCancel",
    namespace: "http://tampermonkey.net",
    version: packageData.version,
    description: packageData.description,
    author: packageData.author,
    match: "*://*.x.com/*",
    icon: "https://icons.duckduckgo.com/ip3/x.com.ico",
  };

  if (process.env.UPDATE_URL) {
    header.updateURL = process.env.UPDATE_URL;
    header.downloadURL = process.env.UPDATE_URL;
  }

  await esbuild.build({
    entryPoints: [p.join("src", "index.js")],
    bundle: true,
    minify: false,
    outfile: p.join("dist", `${packageData.name}.user.js`),
    loader: {
      ".css": "text",
    },
    banner: {
      js: Header.fromObject(header) + "\n",
    },
    define: {
      ENABLE_DEBUG_OUTPUT:
        process.env.NODE_ENV === "development" ? "true" : "false",
    },
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
