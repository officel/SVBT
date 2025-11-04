import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const conventionalChangelogCore = require("conventional-changelog-core");
const preset = require("conventional-changelog-conventionalcommits");
const pkg = require("../package.json");

const changelogPath = "./CHANGELOG.md";

// 既存CHANGELOG読み込み
let existingChangelog = "";
if (fs.existsSync(changelogPath)) {
  existingChangelog = fs.readFileSync(changelogPath, "utf-8").trim();
}

// changelog生成
const changelogStream = conventionalChangelogCore(
  {
    config: preset,
    releaseCount: 1,
  },
  {
    version: pkg.version,
    currentTag: `v${pkg.version}`,
    previousTag: null,
  }
);

let newChangelog = "";
changelogStream.on("data", (chunk) => (newChangelog += chunk.toString()));

changelogStream.on("end", () => {
  const header = "# Changelog\n\n";
  const rest = existingChangelog.replace(/^# Changelog\s*/i, "").trim();

  const output =
    header + newChangelog.trim() + "\n\n" + (rest ? rest + "\n" : "");

  fs.writeFileSync(changelogPath, output);
  console.log("✅ CHANGELOG.md updated");
});
