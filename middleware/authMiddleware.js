const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ✅ Authenticate using Cookie
const authenticate = (req, res, next) => {
    const token = req.cookies.token; // Read token from cookie

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.id, role: decoded.role };
        next();
    } catch (error) {
        console.error("❌ Token verification failed:", error.message);
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

// ✅ Authorize Recruiter middleware (no changes needed)
const authorizeRecruiter = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Access denied. Recruiter role required." });
        }
        next();
    } catch (error) {
        console.error("Middleware error:", error);
        res.status(500).json({ message: "Server error." });
    }
};

// ✅ Authorize Admin middleware (no changes needed)
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
