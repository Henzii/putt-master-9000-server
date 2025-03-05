import userService from "../../services/userService";
import { ContextWithUser, ID } from "../../types";

export default {
    Query: {
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            if (!context?.user?.id) return null;
            return await userService.getUser(undefined, context.user?.id);
        },
        getUsersWithoutGames: async () => {
            const users = await userService.getUsersWithoutGames();
            const mapepdUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                createdAt: user.createdAt
            }));

            return mapepdUsers;
        },
        getUsers: async () => {
            return userService.getUsers();
        },
        getUser: async (_root: unknown, args: {userId: ID}) => {
            return await userService.getUser(undefined, args.userId);
        },
        searchUser: async (_root: unknown, args: { search: string }, context: ContextWithUser) => {
            const res = await userService.searchUser(args.search);
            if (!context.user?.id) {
                res.users = res.users.map(user => {
                    return {...user, id: 'null'};
                });
            }
            return res;
        },
    }
};