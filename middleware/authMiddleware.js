const jwt = require("jsonwebtoken");
const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");

    // Check if Authorization header exists
    if (!authHeader) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }
    // Extract token from "Bearer <token>" format
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. Invalid token format." });
    }

    try {
        // Verify the JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;  // Attach user info to the request
        next();              // Proceed to the next middleware
    } catch (error) {
        return res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = authenticate;

