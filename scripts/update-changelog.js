import fs from "fs";
import conventionalChangelog from "conventional-changelog";
import { createRequire } from "module";
const require = createRequire(import.meta.url);

const pkg = require("../package.json");
const changelogPath = "./CHANGELOG.md";

// 既存のCHANGELOG読み込み
let existingChangelog = "";
if (fs.existsSync(changelogPath)) {
  existingChangelog = fs.readFileSync(changelogPath, "utf-8").trim();
}

// changelog生成 (conventionalcommits preset)
const changelogStream = conventionalChangelog(
  {
    preset: "conventionalcommits",
    releaseCount: 1,
  },
  {
    version: pkg.version,
    currentTag: `v${pkg.version}`,
    previousTag: null,
  },
  null,
  null,
  {
    commitGroupsSort: (a, b) => {
      const order = ["feat", "fix"];
      return order.indexOf(a.title) - order.indexOf(b.title);
    },
    reverse: true,
  }
);

let newChangelog = "";
changelogStream.on("data", (chunk) => {
  newChangelog += chunk.toString();
});

changelogStream.on("end", () => {
  // H1ヘッダは必ず先頭に残す
  let header = "# Changelog\n\n";
  let rest = existingChangelog.replace(/^# Changelog\s*/i, "").trim();

  const output =
    header + newChangelog.trim() + "\n\n" + (rest ? rest + "\n" : "");

  fs.writeFileSync(changelogPath, output);
  console.log("✅ CHANGELOG.md updated");
});
