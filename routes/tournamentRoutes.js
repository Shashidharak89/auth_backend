import express from "express";
import {
  createTournament,
  joinTournament,
  getTournamentDetails,
  getAllTournaments,
} from "../controllers/tournamentController.js";

const router = express.Router();

// Route to create a new tournament
router.post("/create", createTournament);

// Route to join a tournament
router.post("/join/:tournamentId", joinTournament);

// Route to get details of a specific tournament
router.get("/:tournamentId", getTournamentDetails);

// Route to get all tournaments
router.get("/", getAllTournaments);

export default router;
