import { queries } from "./queries";
import { mutations } from "./mutations";

import { ContextWithUser, Game, RawStatsDataHC, Scorecard, User } from "../types";
import { Document } from "mongoose";
import { calculateHc } from "../utils/calculateHc";

import { plusminus, total } from "../utils/calculators";
import { subscriptions } from "./subscriptions/subscriptions";
import { LogEntryDocument } from "../models/Log";
import { mergeTypeDefs, mergeResolvers } from '@graphql-tools/merge';

import { typeDefs as mixedTypeDefs } from './typeDefs';
import subscriptionsTypeDefs from './subscriptions/typeDefs';
import coursesTypeDefs from './courses/typeDefs';

import coursesResolvers from './courses/resolvers';

const mixedResolvers = {
    ...queries,
    ...mutations,
    ...subscriptions,

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
    Scorecard: {
        total: (root: Scorecard) => {
            return total(root.scores);
        },
        plusminus: (root: Scorecard) => {
            return plusminus(root.scores, root.pars);
        },
        // Beer Handicap
        bHc: (root: Scorecard) => {
            return root.beers / 2 || 0;
        },
        hcTotal: (root: Scorecard) => {
            return total(root.scores) - root.hc - (root.beers / 2 || 0);
        },
        hcPlusminus: (root: Scorecard) => {
            return (plusminus(root.scores, root.pars)) - root.hc - (root.beers / 2 || 0);
        }
    },
    Game: {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        scorecards: async (root: Game & Document, args: unknown, context: unknown, info: any) => {
            // Jotta ei turhaan rasiteta tietokantaa, populoidaan scorecards:ssa olevat käyttäjätiedot
            // vain jos user-field on queryssä mukana
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (info.fieldNodes[0].selectionSet.selections.find((s: any) => s.name.value === 'user')) {
                await root.populate('scorecards.user');
            }

            // Lisätään radan par:it jokaiseen scorecardiin jotta saadaan plusminus laskettua Scorecardin resolverissa
            return root.scorecards.map(s => {
                const a = s;
                a.pars = root.pars;
                return a;
            });
        },
        par: (root: Game) => {
            return root.pars.reduce((p, c) => (p + c), 0);
        },
        myScorecard: (root: Game, args: unknown, context: ContextWithUser) => {
            if (!context?.user?.id) throw new Error('Cannot resolve myScorecard, no valid context present.');
            // Etsitään contextissa olevan käyttäjän tuloskortti, populoituna tai ilman
            const sc = root.scorecards.find(sc => (sc.user.id === context.user.id || sc.user.toString() === context.user.id));
            return sc;
        }
    },
    GetHcResponse: {
        // Lasketaan tasoitus (10 viimeisintä kierrosta)
        hc: (root: RawStatsDataHC) => {
            return calculateHc(root.pars, root.scores.slice(-10));
        }
    },
    LogEntry: {
        user: async (root: LogEntryDocument) => {
            await root.populate('user');
            return root.user;
        }
    }
};

export const resolvers = mergeResolvers([mixedResolvers, coursesResolvers]);
export const typeDefs = mergeTypeDefs([mixedTypeDefs, subscriptionsTypeDefs, coursesTypeDefs]);

