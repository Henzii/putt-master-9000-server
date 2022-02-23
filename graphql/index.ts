import { ApolloServer } from "apollo-server";
import { typeDefs } from "./typeDefs";
import { queries } from "./queries";
import { mutations } from "./mutations";

import { ContextWithUser, Game, Layout, SafeUser, Scorecard, User } from "../types";
import { Document } from "mongoose";
import jwt from 'jsonwebtoken';

import permissions from "./permissions";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { isConstValueNode } from "graphql";

const resolvers = {
    ...queries,
    ...mutations,

    Layout: {
        par: (root: Layout) => {
            return root.pars.reduce((p, c) => (p + c), 0);
        },
    },
    User: {
        friends: async (root: Document & User) => {
            await root.populate('friends');
            return root.friends;
        }
    },
    Scorecard: {
        total: (root: Scorecard) => {
            return root.scores.reduce((p, c) => {
                if (!isNaN(c)) return p + c;
                return p;
            }, 0);
        },
        plusminus: (root: Scorecard) => {
            return root.scores.reduce((total: number, current: number, indeksi: number) => {
                if (!isNaN(current)) return total + current - root.pars[indeksi];
                return total;
            }, 0);
        },
    },
    Game: {
        scorecards: async (root: Game & Document, args: unknown, context: unknown, info: any) => {
            // Jotta ei turhaan rasiteta tietokantaa, populoidaan scorecards:ssa olevat käyttäjätiedot
            // vain jos user-field on queryssä mukana
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
            // Etsitään contextissa olevan käyttäjän tuloskortti, populoituna tai ilman
            return root.scorecards.find(sc => (sc.user.id === context.user.id || sc.user.toString() === context.user.id));
        }
    },
};

const schema = applyMiddleware(makeExecutableSchema({ typeDefs, resolvers }), permissions);

export const server = new ApolloServer({
    typeDefs,
    resolvers,
    schema,
    context: ({ req }: { req: ContextRequest }) => {
        const token = (req.headers?.authorization)?.slice(7);
        if (token && process.env.TOKEN_KEY) {
            try {
                const decode = jwt.verify(token, process.env.TOKEN_KEY) as SafeUser;
                return {
                    user: {
                        id: decode.id,
                        name: decode.name,
                    }
                };
            } catch (e) {
                return null;
            }
        }
    }
});

type ContextRequest = {
    headers?: {
        authorization?: string
    }
}

