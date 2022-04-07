import { ApolloServer } from "apollo-server";
import { typeDefs } from "./typeDefs";
import { queries } from "./queries";
import { mutations } from "./mutations";

import { ContextWithUser, Game, Layout, RawStatsDataHC, SafeUser, Scorecard, User } from "../types";
import { Document } from "mongoose";
import jwt from 'jsonwebtoken';

import permissions from "./permissions";
import { applyMiddleware } from "graphql-middleware";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { calculateHc } from "../utils/calculateHc";

import { getDistance } from 'geolib';
import { plusminus, total } from "../utils/calculators";

const resolvers = {
    ...queries,
    ...mutations,

    Layout: {
        par: (root: Layout) => {
            return root.pars.reduce((p, c) => (p + c), 0);
        },
    },
    Course: {
        distance: (root: Layout, args: unknown, context: unknown, info: InfoWithCoordinates) => {
            try {
                const [lon1, lat1] = root.location.coordinates;
                const [lon2, lat2] = info.variableValues.coordinates;
                const distance = getDistance(
                    { latitude: lat1, longitude: lon1 },
                    { latitude: lat2, longitude: lon2 }
                );
                return {
                    meters: distance,
                    string: (distance > 10000)
                        ? Math.floor(distance / 1000) + ' km'
                        : (distance < 1000)
                            ? distance + ' m'
                            : Math.round(distance / 1000 * 10) / 10 + ' km'
                };
            } catch (e) {
                return { meters: 0, string: '' };
            }
        }
    },
    User: {
        friends: async (root: Document & User) => {
            await root.populate('friends');
            return root.friends;
        }
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
    GetHcResponse: {
        // Lasketaan tasoitus
        hc: (root: RawStatsDataHC) => {
            return calculateHc(root.pars, root.scores);
        }
    }
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

type InfoWithCoordinates = {
    variableValues: {
        coordinates: [number, number]
    }
}