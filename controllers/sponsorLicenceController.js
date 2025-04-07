// controllers/sponsorLicenceController.js

exports.estimateLicenceFee = (req, res) => {
    try {
      const {
        licenceType,
        isSmallCompany,
        priorityProcessing
      } = req.body;
  
      if (
        !licenceType ||
        typeof isSmallCompany !== "boolean" ||
        typeof priorityProcessing !== "boolean"
      ) {
        return res.status(400).json({ error: "Missing or invalid fields" });
      }
  
      let licenceFee;
  
      // Determine base licence fee based on licence type and sponsor size
      switch (licenceType) {
        case "Skilled Worker":
        case "Skilled Worker and Temporary Worker":
          licenceFee = isSmallCompany ? 536 : 1476;
          break;
        case "Temporary Worker":
          licenceFee = 536;
          break;
        default:
          return res.status(400).json({ error: "Invalid licence type" });
      }
  
      // Priority processing fee (applies to all if selected)
      const priorityFee = priorityProcessing ? 500 : 0;
  
      const totalFee = licenceFee + priorityFee;
  
      return res.json({
        licenceType,
        sponsorSize: isSmallCompany ? "Small" : "Large",
        priorityProcessing: priorityProcessing ? "Yes" : "No",
        licenceFee,
        priorityFee,
        totalLicenceFee: totalFee,
        message: "Sponsor licence fee estimated successfully."
      });
    } catch (error) {
      console.error("Licence fee estimation error:", error);
      res.status(500).json({ error: "Server error" });
    }
  };
  