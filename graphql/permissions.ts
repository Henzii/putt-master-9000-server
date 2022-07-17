import { ApolloError } from "apollo-server";
import { rule, shield, allow } from "graphql-shield";
import { ContextWithUser } from "../types";

const isLoggedIn = rule({ cache: 'contextual', })(async (parent: unknown, args: unknown, context: ContextWithUser) => {
    return !!(context.user?.id);
});

export default shield({
    Query: {
        "*": isLoggedIn,
        getMe: allow,
        getLiveGame: allow,
        searchUser: allow,

    },
    Mutation: {
        "*": isLoggedIn,
        login: allow,
        createUser: allow,
    }
},
    {
        fallbackError: async (thrownThing) => {
            if (thrownThing instanceof ApolloError) {
                return thrownThing;
            }
            // eslint-disable-next-line no-console
            console.log(thrownThing);
            return new ApolloError('Server error', 'ERR_INTERNAL_SERVER')
        }
    }
);