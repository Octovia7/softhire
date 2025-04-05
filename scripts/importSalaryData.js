const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Salary = require('../models/Salary');
require('dotenv').config();




// Connect to MongoDB
mongoose
.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

const filePath = path.join(__dirname, '../data/salaryData.json');
const rawData = fs.readFileSync(filePath);
const salaryData = JSON.parse(rawData);

const importData = async () => {
  try {
    await Salary.deleteMany(); // Optional: Clear existing data
    await Salary.insertMany(salaryData);
    console.log('Data successfully imported!');
    process.exit();
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData();
