import User from "../models/UserModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "dotenv/config.js";
import cron from 'node-cron';

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
    let checkin=user.checkin;
    // Send the response
    res.status(200).json({ email, token,coins,checkin });
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
  let checkin=user.checkin;

  // Check password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({ error: "Incorrect password." });
  }

  try {
    // Create the JsonWebToken
    const token = createToken(user._id)

    res.status(200).json({ email, token,coins,checkin });
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
        checkin:user.checkin,
       
      },
    });
  } catch (error) {
    // Handle invalid or expired tokens
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};



const updateCoin=async (req, res) => {
  try {
    const { email, amount } = req.body; // Email to identify user, amount to add to coins

    if (!email || typeof amount !== 'number') {
      return res.status(400).json({ error: 'Invalid email or amount' });
    }

    // Find user and update coins
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { $inc: { coins: amount } }, // Increment coins by the amount
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Coins updated successfully', coins: updatedUser.coins });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};



// *************************************CheckIn********************************************8

// Daily check-in route handler
const dailyCheckIn = async (req, res) => {
  const { email } = req.body;

  // Check if the email is provided
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Find the user by email
    const user = await User.findOne({ email });

    // If user does not exist, return an error
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has already checked in
    if (user.checkin) {
      return res.status(400).json({ message: 'You have already checked in today!' });
    }

    // Update the user's coins and set isCheckIn to true
    user.coins += 100;
    user.checkin = true;

    // Save the updated user data
    await user.save();

    // Send a success response
    res.status(200).json({ 
      message: 'Check-in successful! 100 coins added.', 
      coins: user.coins ,
      checkin:user.checkin
      
    });
  } catch (error) {
    console.error('Error during daily check-in:', error);
    res.status(500).json({ message: 'An error occurred while processing your check-in' });
  }
};

// **************************Shedule auto reset********************************

const resetCheckInStatus = async () => {
  try {
    // Update all users to set checkin to false
    await User.updateMany({}, { $set: { checkin: false } });
    console.log('Check-in status reset for all users at midnight.');
  } catch (error) {
    console.error('Error resetting check-in status:', error);
  }
};

// Schedule the reset function to run at 12:00 AM every day
cron.schedule('0 0 * * *', resetCheckInStatus);

console.log('Daily reset scheduled at midnight.');







export { registerUser, loginUser,verifyUser,updateCoin,dailyCheckIn };
