import RagePutt from "../models/RagePutt";
import User from "../models/User";
import { GraphQLError } from "graphql";
import { ID } from "../types";

export const getRagePuttGame = async (gameId: ID, userId: ID) => {
    const game = await RagePutt.findById(gameId);
    if (!game) {
        throw new Error("Game not found");
    }
    if (game.scorecards.every(scorecard => scorecard.user.toString() !== userId)) {
        throw new Error("User is not part of this game");
    }

    return game.populate('scorecards.user');
};

export const getRagePuttGames = async (userId: ID) => {
    const games = await RagePutt.find({ "scorecards.user": userId }).populate('scorecards.user');
    return games;
};

export const createRagePuttGame = async (mode: string, playerIds: ID[]) => {
    if (playerIds.length === 0) {
        throw new GraphQLError("At least one player is required");
    }

    const users = await User.find({ _id: { $in: playerIds } }).select("_id");
    if (users.length !== playerIds.length) {
        throw new GraphQLError("One or more players were not found");
    }

    const scorecards = playerIds.map(playerId => ({
        user: playerId,
        scores: []
    }));

    const game = await RagePutt.create({
        mode,
        startTime: new Date(),
        scorecards
    });
    return game._id;
};

export const updateRagePuttScorecard = async (gameId: ID, playerId: ID, scores: number[], userId: ID) => {
    const game = await RagePutt.findById(gameId);
    if (game?.scorecards.every(scorecard => scorecard.user.toString() !== userId)) {
        throw new Error("User is not part of this game");
    }
    if (!game) {
        throw new Error("Game not found");
    }

    const scorecard = game.scorecards.find(sc => sc.user.toString() === playerId);
    if (!scorecard) {
        throw new Error("Scorecard not found");
    }

    scorecard.scores = scores;

    const roundsInGame = game.mode === 'quick' ? 10 : 20;
    const isFinishedGame = game.scorecards.every(sc => sc.scores.length >= roundsInGame);
    if (isFinishedGame) {
        game.endTime = new Date();
    }

    await game.populate('scorecards.user');
    await game.save();
    return scorecard;
};

export const deleteRagePuttGame = async (gameId: ID, userId: ID) => {
    const game = await RagePutt.findById(gameId);
    if (!game) {
        throw new Error("Game not found");
    }
    if (game.scorecards.every(scorecard => scorecard.user.toString() !== userId)) {
        throw new Error("User is not part of this game");
    }

    await RagePutt.deleteOne({ _id: gameId });
    return true;
};

export default {
    getRagePuttGame,
    getRagePuttGames,
    createRagePuttGame,
    updateRagePuttScorecard,
    deleteRagePuttGame
};