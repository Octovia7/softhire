const Salary = require("../models/Salary");

const getMinSalary = async (code) => {
    const job = await Salary.findOne({
        $or: [
            { occupationCode: code },
            { occupationCode: Number(code) }
        ]
    });

    return job?.standardRate?.annual || null;
};

module.exports = getMinSalary;
