import userService from "../../services/userService";

export default {
    Query: {
        getUsersWithoutGames: async () => {
            const users = await userService.getUsersWithoutGames();
            const mapepdUsers = users.map(user => ({
                id: user.id,
                name: user.name,
                createdAt: user.createdAt
            }));

            return mapepdUsers;
        }
    }
};