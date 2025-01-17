import express from "express";
import mongoose from "mongoose";
import { postsRoutes } from "./routes/postsRoutes.js";
import { usersRoutes } from "./routes/usersRoutes.js";
import cors from "cors";
import dotenv from 'dotenv';

dotenv.config();

const mongo_url=process.env.MONGO_URL;
const port=process.env.PORT;

// Initializing Express app
const app = express();
app.use(cors());
// Middleware to receive JSON
app.use(express.json());

// Adding the API end-points and the route handlers
app.use("/api/posts", postsRoutes);
app.use("/api/users", usersRoutes);

// Connecting to MongoDB using Mongoose
mongoose
  .connect(mongo_url, { dbName: "demo_db" })
  .then(() => {
    console.log("connected to DB successfully");
    
    // Listening to requests if DB connection is successful
    app.listen(port, "localhost", () => console.log("Listening to port ",port));
  })
  .catch((err) => console.log(err));
