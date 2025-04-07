require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
require("./config/passport");
const salaryRoutes = require('./routes/salaryRoutes');
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const sponsorEligibilityRoutes = require("./routes/sponsorEligibilityRoutes");
const Salary = require('./models/Salary'); // Adjust the path if needed
const consultRoutes = require("./routes/consult");
const contactRoutes = require("./routes/contactRoutes");
const iscRoutes= require("./routes/isc");
const app = express();

// ✅ Ensure required environment variables are set
if (!process.env.MONGO_URI || !process.env.SESSION_SECRET) {
    console.error("❌ Missing required environment variables. Check your .env file.");
    process.exit(1);
}

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:5173", "https://softhiredev.netlify.app"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(cookieParser());

// ✅ Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // true on Render
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // Netlify requires "none"
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

// ✅ Passport
app.use(passport.initialize());
app.use(passport.session());

// ✅ Database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() =>
  console.log("✅ MongoDB Connected"))
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/recruiter", recruiterRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/auth/google", googleAuthRoutes);
app.use("/api/sponsor", sponsorEligibilityRoutes);
app.use('/api/salary', salaryRoutes);
app.use("/api", consultRoutes);
app.use("/api", contactRoutes); // Prefix for all routes in contactRoutes.js
app.use("/api/isc",iscRoutes);

// ✅ Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/", (req, res) => {
  res.send("SoftHire API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
