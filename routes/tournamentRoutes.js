import express from "express";
import {
  createTournament,
  getAllTournaments,
  getTournamentDetails,
  joinTournament,
  announceWinner,
} from "../controllers/tournamentController.js";

const router = express.Router();

// Route to create a new tournament
router.post("/create", createTournament);

// Route to get all tournaments
router.get("/", getAllTournaments);

// Route to get details of a specific tournament
router.get("/:tournamentId", getTournamentDetails);

// Route to join a tournament
router.post("/join/:tournamentId", joinTournament);

// Route to announce winner
router.post("/announce-winner/:tournamentId", announceWinner);

export default router;
