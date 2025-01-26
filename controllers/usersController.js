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
  const { email, password, name } = req.body;

  // Check the fields are not empty
  if (!email || !password || !name) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Check if email already exists
  const exist = await User.findOne({ email });
  if (exist) {
    return res.status(400).json({ error: "Email is already taken." });
  }

  // Generate a unique userId
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let userId = "";
  let isUnique = false;

  while (!isUnique) {
    userId = Array.from({ length: 10 }, () =>
      characters.charAt(Math.floor(Math.random() * characters.length))
    ).join("");

    const existingUser = await User.findOne({ userId });
    if (!existingUser) {
      isUnique = true; // Found a unique userId
    }
  }

  // Hash the password
  const salt = await bcrypt.genSalt();
  const hashed = await bcrypt.hash(password, salt);

  try {
    // Register the user
    const user = await User.create({ email, password: hashed, userId, name });
    // Create the JsonWebToken
    const token = createToken(user._id);
    let coins = user.coins;
    let checkin = user.checkin;
    let createdAt = user.createdAt;
    let updatedAt = user.updatedAt;
    let id = user._id;

    // Send the response
    res.status(200).json({
      userId,
      email,
      token,
      coins,
      checkin,
      name,
      createdAt,
      updatedAt,
      id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/************************************ Login User ************************************/
const loginUser = async (req, res) => {
  // Grab data from request body
  const { email, password } = req.body;

  // Check that fields are not empty
  if (!email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // Check if email already exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Incorrect email." });
    }

    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Incorrect password." });
    }

    // Get today's date at midnight
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const lastCheckinDate = user.lastcheckin
      ? new Date(user.lastcheckin).setHours(0, 0, 0, 0)
      : null;

    // Reset checkin to false if lastcheckin is different from today's date
    if (lastCheckinDate === null || currentDate > lastCheckinDate) {
      user.checkin = false; // Reset checkin
      await user.save();    // Save changes to the database
    }

    // Create the JsonWebToken
    const token = createToken(user._id);

    // Prepare the response
    res.status(200).json({
      token,
      coins: user.coins,
      checkin: user.checkin,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      id: user._id,
    });
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

    // Get today's date at midnight
    const currentDate = new Date().setHours(0, 0, 0, 0);
    const lastCheckinDate = user.lastcheckin
      ? new Date(user.lastcheckin).setHours(0, 0, 0, 0)
      : null;

    // Reset checkin to false if lastcheckin is different from today's date
    if (lastCheckinDate === null || currentDate > lastCheckinDate) {
      user.checkin = false; // Reset checkin
      await user.save();    // Save changes to the database
    }

    // Send user details if token is valid
    return res.status(200).json({
      message: "Token is valid",
      user: {
        coins: user.coins,
        name: user.name,
        email: user.email,
        checkin: user.checkin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        id: user._id,
        unique_id: user.userId,
      },
    });
  } catch (error) {
    // Handle invalid or expired tokens
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
// *******************************************Update Coin******************************************************************************
const updateCoin = async (req, res) => {
  try {
    const { email, historyMessage, coinCount } = req.body; // Email, historyMessage, and coinCount from request

    if (!email || !historyMessage || typeof coinCount !== 'number') {
      return res.status(400).json({ error: 'Invalid email, historyMessage, or coinCount' });
    }

    // Find user and update both coins and coinhistory array
    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $inc: { coins: coinCount }, // Increment coins by the coinCount
        $push: { // Push new history message and coin count to the coinhistory array
          coinhistory: { historyMessage, coinCount }
        }
      },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json({ message: 'Coins and coin history updated successfully', coins: updatedUser.coins, coinhistory: updatedUser.coinhistory });
  } catch (error) {
    res.status(500).json({ error: 'Server error', details: error.message });
  }
};





// *************************************CheckIn********************************************8

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

    const currentDate = new Date().setHours(0, 0, 0, 0); // Today's date (midnight)
    const lastCheckinDate = user.lastcheckin
      ? new Date(user.lastcheckin).setHours(0, 0, 0, 0)
      : null; // Last check-in date (midnight)

    // If the user has already checked in today
    if (currentDate === lastCheckinDate && user.checkin) {
      return res.status(400).json({ message: 'You have already checked in today!' });
    }

    // If it's a new day or first check-in, reset the check-in status
    if (currentDate > lastCheckinDate || lastCheckinDate === null) {
      user.checkin = false; // Reset check-in status for the day
    }

    // Allow the check-in
    if (!user.checkin) {
      user.coins += 100; // Add coins for check-in
      user.checkin = true; // Mark check-in as complete
      user.lastcheckin = new Date(); // Update the last check-in date

      // Add coin history for the check-in
      const historyMessage = 'Daily check-in reward';
      const coinCount = 100;
      user.coinhistory.push({ historyMessage, coinCount });

      await user.save();

      return res.status(200).json({
        message: 'Check-in successful! 100 coins added.',
        coins: user.coins,
        checkin: user.checkin,
      });
    }

    return res.status(400).json({ message: 'Unable to check in. Please try again later.' });
  } catch (error) {
    console.error('Error during daily check-in:', error);
    res.status(500).json({ message: 'An error occurred while processing your check-in' });
  }
};


// ***********************Find User name of the tounament winner ************************************************************************

const findUserNameOfwinner = async (req, res) => {
  const userId = req.params.id;

  try {
    // Fetch the user from MongoDB
    const user = await User.findById(userId).select('name userId'); // Only fetch name and userId
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Send the response
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// ****************************************************GetHistory******************************************************************
const getCoinHistory = async (req, res) => {
  const { email } = req.body; // Email to identify the user

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

    // Return the user's coin history
    return res.status(200).json({
      message: 'Coin history retrieved successfully',
      coinhistory: user.coinhistory,
    });
  } catch (error) {
    console.error('Error fetching coin history:', error);
    res.status(500).json({ message: 'An error occurred while retrieving coin history' });
  }
};


export { registerUser, loginUser, verifyUser, updateCoin, dailyCheckIn, findUserNameOfwinner ,getCoinHistory};
