import { User } from "../../types";
import queries from "./queries";
import mutations from './mutations';
import { Document } from "mongoose";

export default {
    User: {
        name: (root: User) => root.name.charAt(0).toUpperCase() + root.name.slice(1),
        friends: async (root: Document & User) => {
            await root.populate('friends');
            return root.friends;
        },
        achievements: async (root: Document & User) => {
            await root.populate('achievements.game');
            return root.achievements;
        }
    },
    SafeUser: {
        name: (root: User) => root.name.charAt(0).toUpperCase() + root.name.slice(1)
    },
    ...queries,
    ...mutations
};