const SkilledWorkerOccupation = require("../models/SkilledWorkerOccupation");

const calculateISC = async (req, res) => {
  try {
    const { occupationCode, isMediumOrLargeSponsor, visaDurationYears } = req.body;

    if (!occupationCode || visaDurationYears == null || isMediumOrLargeSponsor == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const occupation = await SkilledWorkerOccupation.findOne({ socCode: occupationCode });

    if (!occupation) {
      return res.status(404).json({ error: "SOC code not found" });
    }

    if (occupation.iscExempt) {
      return res.json({
        occupationCode,
        jobTitle: occupation.title,
        exempt: true,
        message: "This job is exempt from the Immigration Skills Charge.",
      });
    }

    const ratePerYear = isMediumOrLargeSponsor ? 1000 : 364;
    const totalFee = ratePerYear * visaDurationYears;

    res.json({
      occupationCode,
      jobTitle: occupation.title,
      exempt: false,
      ratePerYear,
      years: visaDurationYears,
      totalISC: totalFee,
      message: "This job is not exempt from the ISC.",
    });
  } catch (error) {
    console.error("ISC calculation error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { calculateISC };
