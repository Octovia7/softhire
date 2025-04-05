const fs = require("fs");
const path = require("path");

const inputPath = path.join(__dirname, "../data/salary_raw.txt");
const outputPath = path.join(__dirname, "../data/salaryData.json");

const rawText = fs.readFileSync(inputPath, "utf-8");

// Find all blocks starting with an occupation code
const entryRegex = /^(\d{4})\t([^\t]+)\t([\s\S]*?)£([\d,]+) \((£?[\d.]+) per hour\)\t£([\d,]+) \((£?[\d.]+) per hour\)/gm;

const entries = [];
let match;

while ((match = entryRegex.exec(rawText)) !== null) {
  const [
    _fullMatch,
    occupationCode,
    jobType,
    rawTitles,
    standardAnnual,
    standardHourly,
    lowerAnnual,
    lowerHourly,
  ] = match;

  const relatedJobTitles = rawTitles
    .split("\n")
    .map((t) => t.trim())
    .filter(Boolean);

  entries.push({
    occupationCode,
    jobType,
    relatedJobTitles,
    standardRate: {
      annual: parseInt(standardAnnual.replace(/,/g, ""), 10),
      hourly: parseFloat(standardHourly),
    },
    lowerRate: {
      annual: parseInt(lowerAnnual.replace(/,/g, ""), 10),
      hourly: parseFloat(lowerHourly),
    },
  });
}

console.log(`✅ Parsed ${entries.length} entries.`);

// Save the JSON output
fs.writeFileSync(outputPath, JSON.stringify(entries, null, 2), "utf-8");
console.log(`✅ Saved to ${outputPath}`);
