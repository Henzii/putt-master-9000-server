import { allow, shield, rule} from "graphql-shield";
import { ContextWithUser } from "../types";
import userService from "../services/userService";
import { GraphQLError } from "graphql";

const isLoggedIn = rule({cache: 'contextual'})(async (_parent, _args, context: ContextWithUser) => {
    return !!context?.user?.id;
});

const isAdmin = rule({cache: 'contextual'})(async (_parent, _args, context: ContextWithUser) => {
    if (!context.user?.id) return false;
    return await userService.isAdmin(context.user.id);
});

export const permissions= shield({
    Query: {
        "*": isLoggedIn,
        handShake: allow,
        getMe: allow,
        getLiveGame: allow,
        ping: allow,
        searchUser: allow,

        getUsers: isAdmin,
        getLogs: isAdmin,
        getUser: isAdmin,
        getUsersWithoutGames: isAdmin
    },

    Mutation: {
        "*": isLoggedIn,
        login: allow,
        createUser: allow,
        restoreAccount: allow,
        sendFeedback: allow,
    },
}, {
    async fallbackError(thrownThing) {
        if (thrownThing instanceof GraphQLError) {
            return thrownThing;
        }
        return new Error('Unknown error :(');
  },
});