const Identity = require("../../models/createProfileSchema/Identity");

exports.updateIdentity = async (req, res) => {
  try {
    const { pronouns, showPronouns, gender, raceEthnicity } = req.body;
    const userId = req.user.id;

    const identityData = {
      pronouns,
      showPronouns,
      gender,
      raceEthnicity,
    };

    const updatedIdentity = await Identity.findOneAndUpdate(
      { userId },
      identityData,
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Identity updated successfully", identity: updatedIdentity });
  } catch (error) {
    console.error("Identity update error:", error);
    res.status(500).json({ error: "Failed to update identity" });
  }
};

// exports.getIdentity = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const identity = await Identity.findOne({ userId });

//     if (!identity) return res.status(404).json({ message: "Identity not found" });

//     res.status(200).json(identity);
//   } catch (error) {
//     console.error("Fetch identity error:", error);
//     res.status(500).json({ error: "Failed to fetch identity" });
//   }
// };
