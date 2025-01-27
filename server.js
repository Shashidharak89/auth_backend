import express from "express";
import mongoose from "mongoose";
import { postsRoutes } from "./routes/postsRoutes.js";
import { usersRoutes } from "./routes/usersRoutes.js";
import cors from "cors";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url'; // Import to create __dirname equivalent
import Tournament from "./routes/tournamentRoutes.js";
import Withdrawl from './routes/withdrawlRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

// Get MongoDB connection URL and port from environment variables
const mongo_url = process.env.MONGO_URL;
const port = process.env.PORT || 5001;

// Create __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initializing Express app
const app = express();

app.use(express.static(path.join(__dirname, 'dist')));

// Enable CORS for all routes
app.use(cors());

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Adding the API endpoints and route handlers
app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/tournament",Tournament);
app.use("/api/withdrawl",Withdrawl);
app.use('/api/admin',adminRoutes);

// Fallback route to serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Connecting to MongoDB using Mongoose
mongoose
  .connect(mongo_url, { dbName: "demo_db" })
  .then(() => {
    console.log("Connected to DB successfully");

    // Start the server only if the DB connection is successful
    app.listen(port, "0.0.0.0", () => console.log(`Listening on port: ${port}`));
  })
  .catch((err) => console.error("Error connecting to DB:", err));
