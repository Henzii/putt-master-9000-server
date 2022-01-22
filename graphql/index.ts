import { ApolloServer } from "apollo-server";
import { typeDefs } from "./typeDefs";
import { queries } from "./queries";
import { mutations } from "./mutations";

import { Layout, Course } from "../types";

const resolvers = {
    ...queries,
    ...mutations,

    Layout: {
        par: (root: Layout) => {
            return root.pars.reduce((p, c) => (p+c), 0);
        },
    },
}

export const server = new ApolloServer({
    typeDefs,
    resolvers,
})