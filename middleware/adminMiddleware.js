const User = require("../models/User");

const authorizeAdmin = async (req, res, next) => {
    try {
        if (!req.user || req.user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = authorizeAdmin;
        