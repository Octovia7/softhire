require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session"); // ✅ Added session middleware for OAuth
const passport = require("passport"); // ✅ Import Passport
require("./config/passport"); // ✅ Configure Passport with Google OAuth

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
// const jobRoutes = require("./routes/jobRoutes");
// const visaRoutes = require("./routes/visaRoutes");
const adminRoutes = require("./routes/adminRoutes"); // ✅ Added Admin Routes
const googleAuthRoutes = require("./routes/googleAuthRoutes"); // ✅ Added Google OAuth Routes

const app = express();

// Middleware
app.use(express.json()); // Parse JSON requests
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL })); // Enable CORS
app.use(cookieParser()); // Parse cookies

// ✅ Session middleware (needed for Passport OAuth authentication)
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
    })
);

// ✅ Initialize Passport for OAuth authentication
app.use(passport.initialize());
app.use(passport.session());

// Database Connection
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("✅ MongoDB Connected"))
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes); // Signup, Login, OTP verification
app.use("/api/user", userRoutes); // User dashboard APIs
app.use("/api/recruiter", recruiterRoutes); // Recruiter dashboard APIs
// app.use("/api/jobs", jobRoutes); // Job-related APIs
// app.use("/api/visa", visaRoutes); // Visa management APIs
app.use("/api/admin", adminRoutes); // ✅ Admin-only APIs
app.use("/api/auth/google", googleAuthRoutes); // ✅ Google OAuth Routes

// Default Route
app.get("/", (req, res) => {
    res.send("SoftHire API is running...");
});

const PORT = process.env.PORT || 5000; // Use the port from .env or default to 5000
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});