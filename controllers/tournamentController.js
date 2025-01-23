import Tournament from "../models/TournamentModel.js";

// Create a new tournament***************************************************************************************************

export const createTournament = async (req, res) => {
  try {
    const { name, pool, maxParticipants, startDate, endDate } = req.body;

    const newTournament = new Tournament({
      name,
      pool,
      maxParticipants,
      startDate,
      endDate,
    });

    await newTournament.save();
    res.status(201).json({ message: "Tournament created successfully", tournament: newTournament });
  } catch (error) {
    res.status(500).json({ message: "Failed to create tournament", error });
  }
};

// Get all tournaments**********************************************************************************************************************

export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find();
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tournaments", error });
  }
};

// Get details of a specific tournament*****************************************************************************************************
export const getTournamentDetails = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId)
      .populate("participants.userId", "name email")
      .populate("winner", "name email");

    if (!tournament) return res.status(404).json({ message: "Tournament not found." });

    res.status(200).json({
      name: tournament.name,
      pool: tournament.pool,
      participantsCount: tournament.participants.length,
      participants: tournament.participants,
      winner: tournament.winner,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tournament details.", error });
  }
};

// Join a tournament
export const joinTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { userId } = req.body;

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) return res.status(404).json({ message: "Tournament not found." });

    if (tournament.participants.length >= tournament.maxParticipants) {
      return res.status(400).json({ message: "Tournament is full." });
    }

    const alreadyJoined = tournament.participants.some(
      (participant) => participant.userId.toString() === userId
    );

    if (alreadyJoined) {
      return res.status(400).json({ message: "User already joined this tournament." });
    }

    tournament.participants.push({ userId });
    await tournament.save();

    res.status(200).json({ message: "Joined tournament successfully.", tournament });
  } catch (error) {
    res.status(500).json({ message: "Failed to join tournament.", error });
  }
};

// Announce winner
export const announceWinner = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { winnerId } = req.body;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) return res.status(404).json({ message: "Tournament not found." });

    const isParticipant = tournament.participants.some(
      (participant) => participant.userId.toString() === winnerId
    );

    if (!isParticipant) {
      return res.status(400).json({ message: "The selected winner is not a participant in this tournament." });
    }

    tournament.winner = winnerId;
    await tournament.save();

    res.status(200).json({ message: "Winner announced successfully.", tournament });
  } catch (error) {
    res.status(500).json({ message: "Failed to announce winner.", error });
  }
};
