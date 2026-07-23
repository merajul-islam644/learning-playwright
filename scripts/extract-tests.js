const ts = require("typescript");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const TESTS_DIR = path.join(__dirname, "../tests");
const OUTPUT_FILE = path.join(__dirname, "../data/data.json");

function getSpecFiles(dir) {
  let files = [];

  if (!fs.existsSync(dir)) return files;

  for (const item of fs.readdirSync(dir)) {
    const full = path.join(dir, item);

    if (fs.statSync(full).isDirectory()) {
      files = files.concat(getSpecFiles(full));
    } else if (item.endsWith(".spec.ts")) {
      files.push(full);
    }
  }

  return files;
}

function generateId(filePath, title) {
  return crypto.createHash("md5").update(`${filePath}:${title}`).digest("hex");
}

function getGitInfo(filePath) {
  try {
    const output = execSync(
      `git log -1 --format="%an|%ae|%ad|%H" -- "${filePath}"`,
      { encoding: "utf8" },
    ).trim();

    const [author, email, lastModified, commitHash] = output.split("|");

    return {
      author,
      email,
      lastModified,
      commitHash,
    };
  } catch {
    return {
      author: "Unknown",
      email: "",
      lastModified: "",
      commitHash: "",
    };
  }
}

function extractTests() {
  const allTests = [];

  const files = getSpecFiles(TESTS_DIR);

  for (const filePath of files) {
    const git = getGitInfo(filePath);

    const source = fs.readFileSync(filePath, "utf8");

    const sourceFile = ts.createSourceFile(
      filePath,
      source,
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );

    let currentDescribe = "";

    function visit(node) {
      // Capture test.describe()
      if (
        ts.isCallExpression(node) &&
        node.expression.getText(sourceFile) === "test.describe"
      ) {
        currentDescribe = node.arguments[0]?.text || "";
      }

      // Capture tests
      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText(sourceFile);

        const isTest =
          expression === "test" ||
          expression === "test.only" ||
          expression === "test.skip" ||
          expression === "test.fixme";

        if (isTest) {
          const title = node.arguments[0]?.text || "";

          const position = sourceFile.getLineAndCharacterOfPosition(
            node.getStart(),
          );

          allTests.push({
            id: generateId(filePath, title),

            title,

            describe: currentDescribe,

            fileName: path.basename(filePath),

            filePath: path.relative(process.cwd(), filePath),

            folder: path.dirname(path.relative(process.cwd(), filePath)),

            line: position.line + 1,

            column: position.character + 1,

            project: null,

            author: git.author,

            email: git.email,

            lastModified: git.lastModified,

            commitHash: git.commitHash,

            status: "idle",

            selected: false,

            skip: expression === "test.skip",

            only: expression === "test.only",

            fixme: expression === "test.fixme",

            tags: [],

            duration: null,

            lastRun: null,

            retry: 0,

            code: node.getText(sourceFile),
          });
        }
      }

      ts.forEachChild(node, visit);
    }

    visit(sourceFile);
  }

  fs.mkdirSync(path.dirname(OUTPUT_FILE), {
    recursive: true,
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(allTests, null, 2));

  console.log(`✅ Extracted ${allTests.length} tests`);
}

module.exports = extractTests;

if (require.main === module) {
  extractTests();
}
