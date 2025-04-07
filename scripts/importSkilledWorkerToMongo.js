require("dotenv").config(); // Load .env before anything else
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const SkilledWorkerOccupation = require("../models/SkilledWorkerOccupation");

const MONGO_URI = process.env.MONGO_URI;
const dataPath = path.join(__dirname, "../data/skilledWorkerData.json");

async function importData() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const rawData = fs.readFileSync(dataPath, "utf-8");
    const occupations = JSON.parse(rawData);

    await SkilledWorkerOccupation.deleteMany({});
    console.log("🧹 Old records removed");

    await SkilledWorkerOccupation.insertMany(occupations);
    console.log(`✅ Imported ${occupations.length} occupations`);
  } catch (error) {
    console.error("❌ Error importing data:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  }
}

importData();
