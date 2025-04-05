const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Authenticate middleware
const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // contains { userId, role }
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// ✅ Authorize Recruiter middleware
const authorizeRecruiter = async (req, res, next) => {
    try {
        console.log("Decoded user in authorizeRecruiter:", req.user); // Log JWT payload
        const user = await User.findById(req.user.id);
        console.log("DB user:", user); // Log actual user from DB

        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Access denied. Recruiter role required." });
        }

        next();
    } catch (error) {
        console.error("Middleware error:", error);
        res.status(500).json({ message: "Server error." });
    }
};


// ✅ Authorize Admin middleware
const authorizeAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied. Admins only." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = {
    authenticate,
    authorizeRecruiter,
    authorizeAdmin
};
