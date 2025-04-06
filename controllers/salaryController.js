const Salary = require('../models/Salary');

// @desc   Search job roles based on keyword (typeahead dropdown support)
// @route  GET /api/salary/search?keyword=software
exports.searchSalary = async (req, res) => {
    const { keyword, page = 1, limit = 10 } = req.query;

    if (!keyword || keyword.trim() === "") {
        return res.status(400).json({ message: "Keyword is required for search" });
    }

    try {
        // Use text index to search relevant job roles
        const salaries = await Salary.find({
            $text: { $search: keyword }
        })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        if (salaries.length === 0) {
            return res.status(404).json({ message: "No matching roles found" });
        }

        // Count total results for pagination info
        const totalResults = await Salary.countDocuments({
            $text: { $search: keyword }
        });

        res.status(200).json({
            message: "Matching roles found",
            salaries: salaries.map(salary => ({
                occupationCode: salary.occupationCode,
                jobType: salary.jobType,
                standardAnnualSalary: salary.standardRate?.annual || null,
                lowerAnnualSalary: salary.lowerRate?.annual || null,
            })),
            totalResults,
            totalPages: Math.ceil(totalResults / limit),
            currentPage: parseInt(page),
        });
    } catch (error) {
        console.error("Error searching for salaries:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// @desc   Get detailed salary info by occupation code
// @route  GET /api/salary/details/:occupationCode
exports.getSalaryDetails = async (req, res) => {
    const { occupationCode } = req.params;

    try {
        const salary = await Salary.findOne({ occupationCode });

        if (!salary) {
            return res.status(404).json({ message: "Salary details not found" });
        }

        res.status(200).json({
            occupationCode: salary.occupationCode,
            jobType: salary.jobType,
            standardAnnualSalary: salary.standardRate?.annual || null,
            lowerAnnualSalary: salary.lowerRate?.annual || null,
            goingRateAnnual: salary.goingRate?.annual || null,
            experienceRequired: salary.experienceRequired || "Not specified",
            notes: salary.notes || null
        });
    } catch (error) {
        console.error("Error fetching salary details:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
