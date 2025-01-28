import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Admin from "../models/adminModel.js";

const router = express.Router();

// Secret key for JWT
const JWT_SECRET = "your_jwt_secret_key";

// Login route
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if the password is correct
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate JWT token
        const token = jwt.sign({ id: admin._id }, JWT_SECRET, {
            expiresIn: "1h", // Token expiration time
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Verify token route
router.get("/verifytoken/:token", async (req, res) => {
    const token = req.params.token; // Extract the token from route parameters

    if (!token) {
        return res.status(400).json({ message: "Token is required" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        const userId = decoded.id;

        // Find the admin in the database
        const admin = await Admin.findById(userId);

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Send admin details if token is valid
        return res.status(200).json({
            message: "Token is valid",
            admin: {
                username: admin.username,
                email: admin.email,
                id: admin._id,
            },
        });
    } catch (error) {
        // Handle invalid or expired tokens
        console.error("Token Verification Error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
});

export default router;
