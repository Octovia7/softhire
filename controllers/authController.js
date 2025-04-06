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

const PendingUser = require("../models/PendingUser");

exports.signup = async (req, res) => {
    const { fullName, email, password, role, organizationName, website, industry } = req.body;

    // validations...

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const existingPending = await PendingUser.findOne({ email });
        if (existingPending) await PendingUser.deleteOne({ email });

        const otp = generateOTP();
        const hashedOTP = await bcrypt.hash(otp, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        const pendingUser = new PendingUser({
            fullName,
            email,
            password: hashedPassword,
            role,
            otpData: { otp: hashedOTP, expires: Date.now() + 10 * 60 * 1000 },
            organizationName,
            website,
            industry,
        });

        await pendingUser.save();

        await transporter.sendMail({
            from: process.env.EMAIL,
            to: email,
            subject: "Verify Your Email - OTP",
            text: `Your OTP is ${otp}. It expires in 10 minutes.`,
        });

        res.status(200).json({ message: "OTP sent to your email" });
    } catch (error) {
        console.error("❌ Signup Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const pendingUser = await PendingUser.findOne({ email });
        if (!pendingUser) {
            return res.status(400).json({ message: "No signup found. Please register first." });
        }

        if (!pendingUser.otpData || !pendingUser.otpData.expires) {
            await PendingUser.deleteOne({ email });
            return res.status(400).json({ message: "OTP not found or invalid. Please sign up again." });
        }

        if (Date.now() > pendingUser.otpData.expires) {
            await PendingUser.deleteOne({ email });
            return res.status(400).json({ message: "OTP expired. Please sign up again." });
        }

        const isMatch = await bcrypt.compare(otp, pendingUser.otpData.otp);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        const newUser = new User({
            fullName: pendingUser.fullName,
            email: pendingUser.email,
            password: pendingUser.password,
            role: pendingUser.role,
            isVerified: true,
        });

        await newUser.save();

        if (pendingUser.role === "recruiter") {
            const organization = new Organization({
                name: pendingUser.organizationName,
                website: pendingUser.website,
                industry: pendingUser.industry,
            });
            await organization.save();

            await Recruiter.create({
                userId: newUser._id,
                organization: organization._id,
                companyName: pendingUser.organizationName,
                website: pendingUser.website,
                position: "Recruiter",
            });
        }

        if (pendingUser.role === "candidate") {
            await Candidate.create({ userId: newUser._id, skills: [] });
        }

        await PendingUser.deleteOne({ email });

        const token = jwt.sign(
            { id: newUser._id, role: newUser.role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.status(200).json({ message: "Account verified successfully", token });
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