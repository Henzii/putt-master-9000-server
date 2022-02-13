import { getCourses } from "../services/courseService";
import { getGames, getGame } from "../services/gameService";
import { ContextWithUser, Course, ID } from "../types";

import userService from "../services/userService";

export const queries = {
    Query: {
        getCourses: async (_root: unknown, args: getCoursesArgs) => {
            const { data: courses, count, hasMore } = await getCourses(args);
            return {
                courses,
                hasMore,
                count,
                nextOffset: hasMore ? (args.offset + args.limit) : null
            }
        },
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            return await userService.getUser(undefined, context.user?.id)
        },
        getGames: async (root: unknown, args: unknown, context: ContextWithUser) => {
            return await getGames(context.user.id)
        },
        getGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new Error('Not enough parameters')
            return await getGame(args.gameId)
        },
        ping: (): String => 'pong!',
        getUsers: async () => {
            return await userService.getUsers();
        },
    }
}

type getCoursesArgs = {
    limit: number,
    offset: number,
    search?: string
}