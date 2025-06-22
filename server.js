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
const iscRoutes = require("./routes/isc");
const sponsorLicenceRoutes = require("./routes/sponsorLicenceRoutes");
const demoRoutes = require("./routes/demo");
const profileRoutes = require("./routes/profile")
const resumeRoutes = require("./routes/resumeRoutes");
const jobpreferenceRoutes = require("./routes/jobPreferenceRoutes");
const jobExpectationRoutes = require("./routes/jobExpectationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminAuthRoutes = require('./routes/adminAuth');
const cosRoutes = require("./routes/cosRoutes");
const orgRoutes = require("./routes/orgRoutes");
const docRoutes = require("./routes/documentRoutes");
const sponsorshipRoutes = require("./routes/sponsorshipRoutes"); // <== NEW
// const adminRoutes = require('./routes/adminRoutes');


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
    origin: ["http://localhost:5173", "https://softhiredev.netlify.app", "http://127.0.0.1:5500"],
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
app.use("/api/auth", googleAuthRoutes);
app.use("/api/sponsor", sponsorEligibilityRoutes);
app.use('/api/salary', salaryRoutes);
app.use("/api", consultRoutes);
app.use("/api", contactRoutes); // Prefix for all routes in contactRoutes.js
app.use("/api/isc", iscRoutes);
app.use("/api", sponsorLicenceRoutes);
app.use("/api",demoRoutes);
app.use("/api/profile",profileRoutes);
app.use("/api/resume",resumeRoutes);
app.use("/api",jobpreferenceRoutes);
app.use("/api" , jobExpectationRoutes);
app.use("/api/jobs",jobRoutes);
app.use("/api/application",applicationRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api",cosRoutes);
app.use("/api" ,orgRoutes);
app.use("/api/document",docRoutes);
app.use("/api/sponsorship", sponsorshipRoutes); // <== NEW
// ✅ Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/", (req, res) => {
  res.send("SoftHire API is running...");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
