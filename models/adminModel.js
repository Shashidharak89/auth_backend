import mongoose from "mongoose";

// Creating post schema using Mongoose Schema class
const AdminSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            default: "User",
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
    },
);

// Creating a model from schema
const Admin = mongoose.model("Admin", AdminSchema);

export default Admin;
