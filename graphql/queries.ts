import { getCourses } from "../services/courseService";
import { getGames, getGame } from "../services/gameService";
import { ContextWithUser, Course, ID } from "../types";

import userService from "../services/userService";

export const queries = {
    Query: {
        getCourses: async (_root: unknown, args: getCoursesArgs) => {
            return await getCourses(args);
        },
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            return await userService.getUser(undefined, context.user?.id)
        },
        getGames: async (r: unknown, r2: unknown, r3: unknown, r4: any) => {
            // Jos kyselyssä kysytään user:ia -> parametriksi true -> user populoidaan.
            return await getGames(r4.fieldNodes[0].selectionSet.loc.source.body.includes('user {'))
        },
        getGame: async(_root: unknown, args: { gameId: ID}) => {
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
    name: string,
    courseId: string
}