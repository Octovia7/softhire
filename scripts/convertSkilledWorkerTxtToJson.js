const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../data/skilled_worker_raw.txt");
const outputPath = path.join(__dirname, "../data/skilledWorkerData.json");

const socCodeRegex = /^\d{4}\t/;

function parseEntries(content) {
  const lines = content.split(/\r?\n/);
  const entries = [];
  let currentEntry = null;

  for (let line of lines) {
    line = line.trim();
    if (line === "") continue;

    if (socCodeRegex.test(line)) {
      if (currentEntry) entries.push(currentEntry);

      const [socCode, title, maybeJob] = line.split("\t");
      currentEntry = {
        socCode: socCode.trim(),
        title: title.trim(),
        relatedJobs: [],
        iscExempt: null,
      };

      if (maybeJob) currentEntry.relatedJobs.push(maybeJob.trim());
    } else if (currentEntry) {
      // Safe: currentEntry exists
      const parts = line.split("\t");
      const lastPart = parts[parts.length - 1].toLowerCase();

      if (lastPart === "yes" || lastPart === "no") {
        currentEntry.iscExempt = lastPart === "yes";
        if (parts.length > 1) {
          currentEntry.relatedJobs.push(parts.slice(0, -1).join("\t").trim());
        }
      } else {
        currentEntry.relatedJobs.push(line.trim());
      }
    } else {
      // Skip line if no currentEntry is active yet (e.g. header line)
      continue;
    }
  }

  if (currentEntry) entries.push(currentEntry);
  return entries;
}

fs.readFile(inputPath, "utf-8", (err, data) => {
  if (err) {
    console.error("❌ Failed to read input file:", err);
    return;
  }

  const parsedData = parseEntries(data);

  fs.writeFile(outputPath, JSON.stringify(parsedData, null, 2), err => {
    if (err) {
      console.error("❌ Failed to write JSON file:", err);
      return;
    }

    console.log(`✅ Parsed ${parsedData.length} entries to ${outputPath}`);
  });
});
