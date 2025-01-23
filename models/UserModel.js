import mongoose from "mongoose";

// Creating post schema using Mongoose Schema class
const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "User",
    },
    userId:{
      type:String,
      unique:true,
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
    coins: {
      type: Number,
      default: 200,
    },
    checkin: {
      type: Boolean,
      default: false,
    },
    lastcheckin: {
      type: Date,
      default: null,
    },
    tournaments: [
      {
        name: {
          type: String,
        },
        joined: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  { timestamps: true }
);

// Creating a model from schema
const User = mongoose.model("User", UserSchema);

export default User;
