const User = require("../models/User");
const Candidate = require("../models/Candidate");
const Recruiter = require("../models/Recruiter");
const Organization = require("../models/Organization");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false,
    },
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.signup = async (req, res) => {
    const { fullName, email, password, role, organizationName, website, industry } = req.body;

    if (!fullName) return res.status(400).json({ message: "Full name is required" });
    if (!validator.isEmail(email)) return res.status(400).json({ message: "Invalid email format" });
    if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minUppercase: 1 })) {
        return res.status(400).json({ message: "Weak password. Must have 8 chars, 1 number, 1 uppercase" });
    }
    if (role === "recruiter" && (!organizationName || !website || !industry)) {
        return res.status(400).json({ message: "Organization name, website, and industry are required for recruiters" });
    }

    try {
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: "User already exists" });

        const otp = generateOTP();
        console.log(`📩 Generated OTP for ${role}:`, otp);

        const hashedOTP = await bcrypt.hash(otp, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            fullName,
            email,
            password: hashedPassword,
            role,
            otpData: { otp: hashedOTP, expires: Date.now() + 10 * 60 * 1000 },
            isVerified: false,
        });

        await user.save();
        console.log("✅ User saved:", user.email);

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Your Email - OTP",
            text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        });

        if (role === "recruiter") {
            const organization = new Organization({ name: organizationName, website, industry });
            await organization.save();

            await Recruiter.create({
                userId: user._id,
                organization: organization._id,
                companyName: organizationName,
                website,
                position: "Recruiter",
            });

            console.log("✅ Recruiter profile created");
        }

        res.status(200).json({ message: "OTP sent to your email" });

    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.verifyOTP = async (req, res) => {
    console.log("📩 Received verify-otp request:", req.body);

    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ message: "Email and OTP are required" });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });

        if (!user.otpData || !user.otpData.otp) {
            return res.status(400).json({ message: "No OTP found. Please request a new OTP." });
        }

        if (Date.now() > user.otpData.expires) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isMatch = await bcrypt.compare(otp, user.otpData.otp);
        if (!isMatch) return res.status(400).json({ message: "Invalid OTP" });

        // Mark user as verified
        user.isVerified = true;
        user.otpData = undefined;
        await user.save();

        if (user.role === "candidate") {
            console.log("📝 Creating candidate profile...");
            await Candidate.create({ userId: user._id, skills: [] });
        }

        // Generate login token immediately
        const loginToken = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });

        res.status(200).json({ message: "Account verified successfully", token: loginToken });
    } catch (error) {
        console.error("🚨 Verify OTP Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });
        if (!(await bcrypt.compare(password, user.password))) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", maxAge: 3600000 });
        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.logout = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
};