import queries from "./queries";
import mutations from "./mutations";
import { GroupDocument } from "../../models/Group";

const resolvers = {
    ...queries,
    ...mutations,

    Group: {
        owner: async (root: GroupDocument) => {
            await root.populate('owner');
            return root.owner;
        },
        users: async (root: GroupDocument) => {
            await root.populate('users');
            return root.users;
        },
        games: async (root: GroupDocument) => {
            await root.populate('games');
            return root.games;
        }
    }
};

export default resolvers;