import mongoose from "mongoose";

const TournamentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    pool: { type: Number, default: 0 },
    maxParticipants: { type: Number, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    entry:{type:Number,default:0},
    participants: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      },
    ],
    winner: {
      type: mongoose.Schema.Types.ObjectId, // Reference to User ID
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

const Tournament = mongoose.model("Tournament", TournamentSchema);
export default Tournament;
