require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const { Server } = require("socket.io");
const http = require("http");

require("./config/passport");

// ⬇️ Import Routes
const salaryRoutes = require("./routes/salaryRoutes");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const recruiterRoutes = require("./routes/recruiterRoutes");
const adminRoutes = require("./routes/adminRoutes");
const googleAuthRoutes = require("./routes/googleAuthRoutes");
const sponsorEligibilityRoutes = require("./routes/sponsorEligibilityRoutes");
const consultRoutes = require("./routes/consult");
const contactRoutes = require("./routes/contactRoutes");
const iscRoutes = require("./routes/isc");
const sponsorLicenceRoutes = require("./routes/sponsorLicenceRoutes");
const demoRoutes = require("./routes/demo");
const profileRoutes = require("./routes/profile");
const resumeRoutes = require("./routes/resumeRoutes");
const jobpreferenceRoutes = require("./routes/jobPreferenceRoutes");
const jobExpectationRoutes = require("./routes/jobExpectationRoutes");
const jobRoutes = require("./routes/jobRoutes");
const applicationRoutes = require("./routes/applicationRoutes");
const adminAuthRoutes = require("./routes/adminAuth");
const cosRoutes = require("./routes/cosRoutes");
const orgRoutes = require("./routes/orgRoutes");
const docRoutes = require("./routes/documentRoutes");
const chatRoutes = require("./routes/chat.routes.js");
const sponsorshipRoutes = require("./routes/sponsorshipRoutes"); // ✅ New

const chatSocket = require("./sockets/chat");

const app = express();
const server = http.createServer(app);
const allowedOrigins = process.env.CORS_ORIGIN.split(',');

// ✅ Initialize Socket.IO with the raw HTTP server
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});
chatSocket(io);

// ✅ Middleware
app.use(express.json());
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "none",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

// ✅ MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
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
app.use("/api/salary", salaryRoutes);
app.use("/api", consultRoutes);
app.use("/api", contactRoutes);
app.use("/api/isc", iscRoutes);
app.use("/api", sponsorLicenceRoutes);
app.use("/api", demoRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api", jobpreferenceRoutes);
app.use("/api", jobExpectationRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/application", applicationRoutes);
app.use("/api/document", docRoutes);
app.use("/api", cosRoutes);
app.use("/api", orgRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/sponsorship", sponsorshipRoutes); // ✅ New

// ✅ Health check
app.get("/health", (req, res) => res.json({ status: "ok" }));
app.get("/", (req, res) => res.send("SoftHire API is running..."));

// ✅ Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
