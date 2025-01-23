import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pool: {
      type: Number,
      default: 0, // The prize pool amount
    },
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // Reference to the User collection
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    maxParticipants: {
      type: Number, // Optional limit for participants
      default: 100, // Example limit
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

const Tournament = mongoose.model("Tournament", TournamentSchema);

export default Tournament;
