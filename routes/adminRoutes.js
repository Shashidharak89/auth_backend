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
        const token = jwt.sign({ id: admin._id, email: admin.email }, JWT_SECRET, {
            expiresIn: "1h", // Token expiration time
        });

        res.status(200).json({ message: "Login successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});



const verifyToken = (req, res, next) => {
    const token = req.params.token; // Extract the token from the route parameter
    if (!token) {
        return res.status(403).json({ message: "No token provided" });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded; // Store decoded data in the request object
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

// Token verification route
router.get("/verify-token/:token", verifyToken, (req, res) => {
    res.status(200).json({
        message: "Token is valid",
        user: req.user, // Return the decoded token payload
    });
});

// Register route (optional, for admin creation)
// router.post("/register", async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
        
//         const existingAdmin = await Admin.findOne({ email });
//         if (existingAdmin) {
//             return res.status(400).json({ message: "Admin already exists" });
//         }

//         const hashedPassword = await bcrypt.hash(password, 10);

        
//         const newAdmin = new Admin({
//             username,
//             email,
//             password: hashedPassword,
//         });

//         await newAdmin.save();

//         res.status(201).json({ message: "Admin created successfully" });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: "Server error" });
//     }
// });

export default router;
