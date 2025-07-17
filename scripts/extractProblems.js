const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const FOLDER_PATH = "LeetCode-Problems";

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

    console.log(`✅ diff shape: ${diff}`);
  const addedLines = diff
    .split("\n")
    .filter(line => line.startsWith("+") && !line.startsWith("+++"));
    console.log(`✅ addeLines shape: ${addedLines}`);

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
        foldername: `${id}.${sanitizedTitle}`,
        url,
      });
    }
  }

  return problems;
}

function createProblemFiles(problems) {
  problems.forEach(problem => {
    const folderPath = path.join(FOLDER_PATH, problem.foldername);

    if (!fs.existsSync(folderPath)) {
        console.log(`✅ Created: ${folderPath}`);
        fs.mkdirSync(folderPath, { recursive: true });
    }else{
        console.log(`⚠️ Already exists: ${folderPath}`);
    }
  });
}

// 🔁 Main logic
function main() {
  const diff = getReadmeDiff();
  const problems = extractNewProblems(diff);

  if (problems.length === 0) {
    console.log("No new problems found.");
    return;
  }

//   for(let i = 0 ; i < problems.length ; i++){
//     console.log(problems[i]);
//   }

  createProblemFiles(problems);
}

main();
