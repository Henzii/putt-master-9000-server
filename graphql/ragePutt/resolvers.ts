import { RagePuttGame } from "../../models/RagePutt";
import ragePuttService from "../../services/ragePuttService";
import { ContextWithUser, ID } from "../../types";

type GetRagePuttGameArgs = {
    gameId: string
}

type UpdateRagePuttGameArgs = {
    gameId: string,
    playerId: ID,
    scores: number[]
}

type CreateRagePuttGameArgs = {
    mode?: 'default',
    playerIds: ID[]
}

export default {
    Query: {
        getRagePuttGame: async (_: unknown, { gameId }: GetRagePuttGameArgs, context: ContextWithUser) => {
            return ragePuttService.getRagePuttGame(gameId, context.user.id);
        },
        getRagePuttGames: async (_: unknown, __: unknown, context: ContextWithUser) => {
            return ragePuttService.getRagePuttGames(context.user.id);
        }
    },
    Mutation: {
        createRagePuttGame: async (_: unknown, { mode = 'default', playerIds }: CreateRagePuttGameArgs, context: ContextWithUser) => {
            return ragePuttService.createRagePuttGame(mode, playerIds);
        },
        updateRagePuttScorecard: async (_: unknown, { gameId, playerId, scores }: UpdateRagePuttGameArgs, context: ContextWithUser) => {
            return ragePuttService.updateRagePuttScorecard(gameId, playerId, scores, context.user.id);
        },
        deleteRagePuttGame: async (_: unknown, { gameId }: { gameId: string }, context: ContextWithUser) => {
            return ragePuttService.deleteRagePuttGame(gameId, context.user.id);
        }
    },
    RagePuttGame: {
        isFinished: (root: RagePuttGame) => Boolean(root.endTime)
    },
    RagePuttScorecard: {
        points: (root: { scores: number[] }) => root.scores?.reduce((acc, score, index) => {
            const currenPosition = index > 0 ? 5 + root.scores[index - 1] : 10;
            return acc + currenPosition * score;
        }, 0) ?? 0
    }
};