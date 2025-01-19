import express from "express";
import mongoose from "mongoose";
import { postsRoutes } from "./routes/postsRoutes.js";
import { usersRoutes } from "./routes/usersRoutes.js";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

// Get MongoDB connection URL and port from environment variables
const mongo_url = process.env.MONGO_URL;
const port = process.env.PORT || 5001;

// Initializing Express app
const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());

// Adding the API endpoints and route handlers
app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);
app.get('*',(req,res)=>{
res.sendFile(Path2D.join(__dirname,'build','index.html'));
});




// Connecting to MongoDB using Mongoose
mongoose
  .connect(mongo_url, { dbName: "demo_db" })
  .then(() => {
    console.log("Connected to DB successfully");

    // Listening to requests if DB connection is successful
    app.listen(port, "0.0.0.0", () => console.log(`Listening on port: ${port}`));
  })
  .catch((err) => console.error("Error connecting to DB:", err));
