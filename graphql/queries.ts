import { getCourses } from "../services/courseService";
import { getGames, getGame } from "../services/gameService";
import { ContextWithUser, ID } from "../types";

import userService from "../services/userService";
import { getPlayersScores } from "../services/statsService";
import { ApolloError } from "apollo-server";

export const queries = {
    Query: {
        getCourses: async (_root: unknown, args: getCoursesArgs) => {
            try {
                const { data: courses, count, hasMore } = await getCourses(args);
                return {
                    courses,
                    hasMore,
                    count,
                    nextOffset: hasMore ? (args.offset + args.limit) : null
                };
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(e, args);
            }
        },
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            if (!context.user?.id) return null;
            return await userService.getUser(undefined, context.user?.id);
        },
        getGames: async (root: unknown, args: { onlyOpenGames?: boolean }, context: ContextWithUser) => {
            return await getGames(context.user.id, args.onlyOpenGames);
        },
        getGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new Error('Not enough parameters');
            return await getGame(args.gameId);
        },
        getLiveGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new Error('Params error');
            const game = await getGame(args.gameId);
            if (game.isOpen) return game;
            // Kauanko peli on ollut suljettuna (tuntia)
            const diff = ((new Date(Date.now()).getTime() - new Date(game.endTime).getTime()) / 1000 / 60 / 60);
            if (diff > 24) throw new ApolloError('Game is no longer available on live feed');
            return game;
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
        },
        searchUser: async (_root: unknown, args: { search: string }) => {
            const res = await userService.searchUser(args.search);
            return res;
        },
        getEvents: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            return null;
        },
    }
};

type getCoursesArgs = {
    limit: number,
    offset: number,
    search?: string
}