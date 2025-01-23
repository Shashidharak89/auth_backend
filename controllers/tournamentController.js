import Tournament from "../models/TournamentModel.js";

// Create a new tournament
export const createTournament = async (req, res) => {
  try {
    const { name, pool, maxParticipants, startDate, endDate } = req.body;

    const newTournament = new Tournament({
      name,
      pool: pool || 0,
      maxParticipants,
      startDate,
      endDate,
    });

    await newTournament.save();
    res.status(201).json({ message: "Tournament created successfully.", tournament: newTournament });
  } catch (error) {
    res.status(500).json({ message: "Failed to create tournament.", error });
  }
};

// Join a tournament
export const joinTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const { userId, entryFee } = req.body;

    const tournament = await Tournament.findById(tournamentId);

    if (!tournament) return res.status(404).json({ message: "Tournament not found." });

    if (tournament.participants.length >= tournament.maxParticipants)
      return res.status(400).json({ message: "Tournament is full." });

    const alreadyJoined = tournament.participants.some(
      (participant) => participant.userId.toString() === userId.toString()
    );

    if (alreadyJoined) return res.status(400).json({ message: "User already joined this tournament." });

    tournament.participants.push({ userId });
    tournament.pool += entryFee;
    await tournament.save();

    res.status(200).json({ message: "User joined the tournament successfully.", tournament });
  } catch (error) {
    res.status(500).json({ message: "Failed to join tournament.", error });
  }
};

// Get details of a specific tournament
export const getTournamentDetails = async (req, res) => {
  try {
    const { tournamentId } = req.params;

    const tournament = await Tournament.findById(tournamentId).populate(
      "participants.userId",
      "name email"
    );

    if (!tournament) return res.status(404).json({ message: "Tournament not found." });

    res.status(200).json({
      name: tournament.name,
      pool: tournament.pool,
      participantsCount: tournament.participants.length,
      participants: tournament.participants,
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tournament details.", error });
  }
};

// Get all tournaments
export const getAllTournaments = async (req, res) => {
  try {
    const tournaments = await Tournament.find().sort({ createdAt: -1 });
    res.status(200).json(tournaments);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch tournaments.", error });
  }
};
