import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";

/************************************ Creating JWT token ************************************/
const createToken = (_id) => {
  // Creating a new signature
  return jwt.sign({ _id }, process.env.SECRET, { expiresIn: "10d" });
};

/************************************ Register User ************************************/
const registerUser = async (req, res) => {
  // Grab data from request body
  const { email, password } = req.body;

  // Check the fields are not empty
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if email already exist
  const exist = await User.findOne({ email });
  if (exist) {
    return res.status(400).json({ error: "Email is already taken" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  try {
    // Register the user
    const user = await User.create({ email, password: hashed });
    // Create the JsonWebToken
    const token = createToken(user._id)
    let coins=user.coins;
    // Send the response
    res.status(200).json({ email, token,coins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Login User ************************************/
const loginUser = async (req, res) => {
  // Grab data from request body
  const { email, password } = req.body;

  // Check the fields are not empty
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if email already exist
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: "Incorrect email." });
  }

  let coins=user.coins;

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Incorrect password." });
  }

  try {
    // Create the JsonWebToken
    const token = createToken(user._id)

    res.status(200).json({ email, token,coins });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ***************************************Verify jwt tocken**********************************************

const verifyUser = async (req, res) => {
  const token = req.query.token; // Extract the token from query parameters

  if (!token) {
    return res.status(400).json({ message: "Token is required" });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET);
    const userId = decoded._id;

    // Find the user in the database
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Send user details if token is valid
    return res.status(200).json({
      message: "Token is valid",
      user: {
        coins: user.coins,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    // Handle invalid or expired tokens
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};







export { registerUser, loginUser,verifyUser };
