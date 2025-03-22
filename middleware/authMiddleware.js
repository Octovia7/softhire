const jwt = require("jsonwebtoken");
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
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

const authorizeRecruiter = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "recruiter") {
            return res.status(403).json({ message: "Access denied. Recruiter role required." });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error." });
    }
};

module.exports = { authenticate, authorizeRecruiter  , authorizeAdmin };
