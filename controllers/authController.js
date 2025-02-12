const User = require("../models/User");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const validator = require("validator");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config();

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
        rejectUnauthorized: false, // Helps prevent authentication errors
    },
});

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Signup (Step 1): Send OTP
exports.signup = async (req, res) => {
    const { email, password, accountType, organizationName, organizationLicense } = req.body;

    // Validate email and password
    if (!validator.isEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
    }
    if (!validator.isStrongPassword(password, { minLength: 8, minNumbers: 1, minUppercase: 1 })) {
        return res.status(400).json({ message: "Password must be at least 8 characters with 1 number and 1 uppercase letter" });
    }

    try {
        let user = await User.findOne({ email }).lean();
        if (user) return res.status(400).json({ message: "User already exists" });

        // Validate organization fields if user is an organization
        if (accountType === "organization") {
            if (!organizationName || !organizationLicense) {
                return res.status(400).json({ message: "Organization name and license are required" });
            }
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + (Number(process.env.OTP_EXPIRY_MINUTES) || 10) * 60 * 1000); // Default 10 mins

        // Hash OTP & Password
        const hashedOTP = await bcrypt.hash(otp, 10);
        const hashedPassword = await bcrypt.hash(password, 10);

        user = new User({
            email,
            password: hashedPassword,
            otp: hashedOTP,
            otpExpires,
            accountType,
            organizationName: accountType === "organization" ? organizationName : undefined,
            organizationLicense: accountType === "organization" ? organizationLicense : undefined,
        });
        await user.save();

        // Send OTP email
        try {
            await transporter.sendMail({
                from: process.env.EMAIL,
                to: email,
                subject: "Verify Your Email - OTP",
                text: `Your OTP is ${otp}. It expires in ${process.env.OTP_EXPIRY_MINUTES || 10} minutes.`,
            });
            res.status(200).json({ message: "OTP sent to your email" });
        } catch (emailError) {
            console.error("Error sending OTP email:", emailError);
            res.status(500).json({ message: "Failed to send OTP email" });
        }

    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Signup (Step 2): Verify OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        if (user.isVerified) return res.status(400).json({ message: "Already verified" });

        // Check OTP Expiry
        if (new Date(user.otpExpires) < new Date()) {
            return res.status(400).json({ message: "OTP expired" });
        }

        const isOTPValid = await bcrypt.compare(otp, user.otp);
        if (!isOTPValid) return res.status(400).json({ message: "Invalid OTP" });

        user.isVerified = true;
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        res.status(200).json({ message: "Account verified successfully" });
    } catch (error) {
        console.error("Error verifying OTP:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Login (Email & Password)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "User not found" });
        if (!user.isVerified) return res.status(400).json({ message: "Please verify your email first" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user._id, accountType: user.accountType },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 3600000, // 1 hour
        });

        res.status(200).json({ 
            message: "Login successful",
            expiresIn: 3600,
            accountType: user.accountType // Send accountType for frontend role-based UI
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: error.message });
    }
};

// Logout
exports.logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "Logged out successfully" });
};

// Middleware for authentication
exports.authenticate = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Session expired, please log in again" });
            }
            return res.status(401).json({ message: "Invalid token" });
        }
        req.user = decoded;
        next();
    });
};
