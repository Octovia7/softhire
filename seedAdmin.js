const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

mongoose.connect("mongodb://localhost:27017/softhire", { useNewUrlParser: true, useUnifiedTopology: true });

const seedAdmin = async () => {
    try {
        const adminExists = await User.findOne({ email: "softhire7@gmail.com" });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash("Admin@123", 10);
            await User.create({
                fullName: "Admin",
                email: "softhire7@gmail.com",
                password: hashedPassword,
                role: "admin",
                isVerified: true,
            });
            console.log("Admin user created!");
        } else {
            console.log("Admin user already exists.");
        }
        mongoose.connection.close();
    } catch (error) {
        console.error("Error seeding admin:", error);
        mongoose.connection.close();
    }
};

seedAdmin();
