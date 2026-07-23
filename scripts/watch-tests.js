const chokidar = require("chokidar");
const path = require("path");

const extractTests = require("./extract-tests");

const testsDir = path.join(__dirname, "../tests");

// Initial generation
extractTests();

console.log("👀 Watching test files...");

const watcher = chokidar.watch(testsDir, {
  persistent: true,
  ignoreInitial: true,
});

watcher
  .on("add", (file) => {
    console.log("➕ Added:", file);
    extractTests();
  })
  .on("change", (file) => {
    console.log("✏ Changed:", file);
    extractTests();
  })
  .on("unlink", (file) => {
    console.log("🗑 Deleted:", file);
    extractTests();
  })
  .on("error", (err) => {
    console.error(err);
  });
