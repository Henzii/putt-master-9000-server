import { getCourses } from "../services/courseService";
import { getGames, getGame } from "../services/gameService";
import { ContextWithUser, ID } from "../types";

import userService from "../services/userService";
import { getPlayersScores } from "../services/statsService";

export const queries = {
    Query: {
        getCourses: async (_root: unknown, args: getCoursesArgs) => {
            const { data: courses, count, hasMore } = await getCourses(args);
            return {
                courses,
                hasMore,
                count,
                nextOffset: hasMore ? (args.offset + args.limit) : null
            };
        },
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            if (!context.user?.id) return null;
            return await userService.getUser(undefined, context.user?.id);
        },
        getGames: async (root: unknown, args: unknown, context: ContextWithUser) => {
            return await getGames(context.user.id);
        },
        getGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new Error('Not enough parameters');
            return await getGame(args.gameId);
        },
        ping: (): string => 'pong!',
        getUsers: async () => {
            return await userService.getUsers();
        },
        getHc: async (_root: unknown, args: { course: string, layout: string }, context: ContextWithUser) => {
            const res = await getPlayersScores(args.course, args.layout, [context.user.id]);
            return res.map(user => {
                return {
                    id: user._id,
                    games: user.games,
                    scores: user.scores,
                    pars: user.pars,
                };
            });
        }
    }
};

type getCoursesArgs = {
    limit: number,
    offset: number,
    search?: string
}