const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const README_PATH = "README.md";
const CODES_DIR = "codes";

// 1. get README.md diff
function getReadmeDiff() {
  try {
    const diff = execSync("git diff HEAD~1 -- README.md", {
      encoding: "utf-8",
    });
    return diff;
  } catch (e) {
    console.error("❌ Error getting diff:", e.message);
    return "";
  }
}

// 2. extract new problem lines from diff
function extractNewProblems(diff) {
  const addedLines = diff
    .split("\n")
    .filter(line => line.startsWith("+") && !line.startsWith("+++"));

  const problemRegex = /\[(\d+\w?)\. (.+?)\]\((https:\/\/leetcode\.com\/problems\/.+?)\)/g;

  const problems = [];

  for (const line of addedLines) {
    let match;
    while ((match = problemRegex.exec(line)) !== null) {
      const [_, id, title, url] = match;
      const sanitizedTitle = title.replace(/[^\w]/g, "_");
      problems.push({
        id,
        title,
        filename: `${id}_${sanitizedTitle}.js`,
        url,
      });
    }
  }

  return problems;
}

// 3. get all subfolders under 'codes'
function getSubfolders(basePath) {
  return fs
    .readdirSync(basePath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => path.join(basePath, dirent.name));
}

// 4. create files
function createFilesInFolders(folders, problems) {
  for (const folder of folders) {
    for (const problem of problems) {
      const filePath = path.join(folder, problem.filename);
      if (!fs.existsSync(filePath)) {
        const content = `// ${problem.id}. ${problem.title}\n// ${problem.url}\n\n`;
        fs.writeFileSync(filePath, content);
        console.log(`✅ Created: ${filePath}`);
      } else {
        console.log(`⚠️ Already exists: ${filePath}`);
      }
    }
  }
}

// 🔁 Main logic
function main() {
  const diff = getReadmeDiff();
  const problems = extractNewProblems(diff);

  if (problems.length === 0) {
    console.log("No new problems found.");
    return;
  }

  for(let i = 0 ; i < problems.length ; i++){
    console.log("!added problems!");
    console.log(problems[i]);
  }

  //const folders = getSubfolders(CODES_DIR);
  //createFilesInFolders(folders, problems);
}

main();
