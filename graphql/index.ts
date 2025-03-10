import { queries } from "./queries";
import { mutations } from "./mutations";

import { subscriptions } from "./subscriptions/subscriptions";
import { LogEntryDocument } from "../models/Log";
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { typeDefs as mixedTypeDefs } from './typeDefs';
import subscriptionsTypeDefs from './subscriptions/typeDefs';
import coursesTypeDefs from './courses/typeDefs';
import userTypeDefs from './users/typeDefs';
import gameTypeDefs from './games/typeDefs';

import coursesResolvers from './courses/resolvers';
import userResolvers from './users/resolvers';
import gameResolvers from './games/resolvers';

const mixedResolvers = {
    ...queries,
    ...mutations,
    ...subscriptions,

    LogEntry: {
        user: async (root: LogEntryDocument) => {
            await root.populate('user');
            return root.user;
        }
    }
};

export const resolvers = mergeResolvers([mixedResolvers, coursesResolvers, userResolvers, gameResolvers]);
export const typeDefs = mergeTypeDefs([mixedTypeDefs, subscriptionsTypeDefs, coursesTypeDefs, userTypeDefs, gameTypeDefs]);

