import { rule, shield, deny, allow } from "graphql-shield";
import { ContextWithUser } from "../types";

const isLoggedIn = rule({ cache: 'contextual',})( async( parent: unknown, args: unknown, context: ContextWithUser, info: unknown) => {
    return !!(context.user?.id)
})

export default shield({
    Query: {
        "*": isLoggedIn,
        getMe: allow,

    },
    Mutation: {
        "*": isLoggedIn,
        login: allow,
        createUser: allow,
    }
})