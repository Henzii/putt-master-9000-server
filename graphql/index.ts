import { queries } from "./queries";
import { mutations } from "./mutations";

import { ContextWithUser, Game, Layout, RawStatsDataHC, Scorecard, User, Course } from "../types";
import { Document } from "mongoose";
import { calculateHc } from "../utils/calculateHc";

import { getDistance } from 'geolib';
import { plusminus, total } from "../utils/calculators";
import { subscriptions } from "./subscriptions";
import { LogEntryDocument } from "../models/Log";

export const resolvers = {
    ...queries,
    ...mutations,
    ...subscriptions,

    Layout: {
        par: (root: Layout) => {
            return root.pars.reduce((p, c) => (p + c), 0);
        },
        canEdit: (root: Layout, args: unknown, context: ContextWithUser) => {
            return context.user.id === root.creator?.toString() || context.user.id == root.courseCreator?.toString();
        }
    },
    Course: {
        layouts: (root: Course) => {
            return root.layouts.map(layout => {
                layout.courseCreator = root.creator;
                return layout;
            });
        },
        canEdit: (root: Course, args: unknown, context: ContextWithUser) => {
            return context.user.id === root.creator?.toString();
        },
        distance: (root: Course, args: unknown, context: unknown, info: InfoWithCoordinates) => {
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
    LayoutStats: {
        best: (root: LayoutStatsRoot) => {
            return root.scores.reduce((p, c) => {
                const total = c.reduce((sum, score) => sum + score, 0);
                if (!p || total < p) return total;
                return p;
            }, 0);
        },
        hc: (root: LayoutStatsRoot) => {
            const sumTable = root.scores.slice(-10).reduce((p, c) => {
                return [...p, c.reduce((sum, score) => sum + score, 0)];
            }, []);
            const hc = calculateHc(root.pars, sumTable);
            return hc;
        }
    },
    LogEntry: {
        user: async (root: LogEntryDocument) => {
            await root.populate('user');
            return root.user;
        }
    }
};

type LayoutStatsRoot = {
    scores: number[][],
    pars: number[]
}

type InfoWithCoordinates = {
    variableValues: {
        coordinates: [number, number]
    }
}