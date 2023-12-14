import { getCourses, getLayout } from "../services/courseService";
import gameService, { getGames, getGame, getGamesWithUser } from "../services/gameService";
import { ContextWithUser, ID } from "../types";

import userService from "../services/userService";
import { getBestPoolGame, getPlayersScores, getStatsForLayoyt } from "../services/statsService";

import appInfo from "../utils/appInfo";
import { SUB_TRIGGERS, pubsub } from "./subscriptions";
import { GraphQLError } from "graphql";
import { addMonths, addYears, endOfMonth, format, startOfMonth } from "date-fns";
import { GetArgs, GetGamesArgs, GetPastActivityArgs } from "./types";

export const queries = {
    Query: {
        handShake: async () => {
            return {
                ...appInfo
            };
        },
        getCourses: async (_root: unknown, args: GetArgs) => {
            try {
                const { data: courses, count, hasMore } = await getCourses(args);
                return {
                    courses,
                    hasMore,
                    count,
                    nextOffset: hasMore ? (args.offset + args.limit) : null
                };
            } catch (e) {
                // eslint-disable-next-line no-console
                console.log(e, args);
            }
        },
        getLayout: (_root: unknown, args: {layoutId: ID}) => {
            return getLayout(args.layoutId);
        },
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            if (!context?.user?.id) return null;
            return await userService.getUser(undefined, context.user?.id);
        },
        getGames: async (root: unknown, args: GetGamesArgs, context: ContextWithUser) => {
            return await getGames({ userId: context.user.id, ...args});
        },
        getLiveGames: (root: unknown, args: unknown, context: ContextWithUser) => {
            return gameService.getLiveGames(context.user.id);
        },
        getGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new GraphQLError('Not enough parameters');
            return await getGame(args.gameId);
        },
        getLiveGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new GraphQLError('GameId missing from parameters');
            const game = await getGame(args.gameId);
            if (game.isOpen) return game;
            // Kauanko peli on ollut suljettuna (tuntia)
            if (!game.endTime) throw new GraphQLError('Error, endTime not set');
            const diff = ((new Date(Date.now()).getTime() - new Date(game.endTime).getTime()) / 1000 / 60 / 60);
            if (diff > 24) throw new GraphQLError('Game is no longer available on live feed');
            return game;
        },
        ping: () => {
            pubsub.publish(SUB_TRIGGERS.TEST, {test: 'Ping pong'});
            return 'pong';
        },
        getUsers: async () => {
            return userService.getUsers();
        },
        getLayoutStats: async (_root: unknown, args: { layoutId: ID, playersIds: ID[]}, context: ContextWithUser) => {
            const res = await getStatsForLayoyt(args.layoutId, args.playersIds || [context.user.id]);
            return res;
        },
        getHc: async (_root: unknown, args: {layoutId: ID, userIds: ID[] }, context: ContextWithUser) => {
            const res = await getPlayersScores(args.layoutId, args.userIds || [context.user.id]);
            return res.map(user => {
                return {
                    id: user._id,
                    games: user.games,
                    scores: user.scores,
                    pars: user.pars,
                };
            });
        },
        searchUser: async (_root: unknown, args: { search: string }, context: ContextWithUser) => {
            const res = await userService.searchUser(args.search);
            if (!context.user?.id) {
                res.users = res.users.map(user => {
                    return {...user, id: 'null'};
                });
            }
            return res;
        },
        getAllGames: async (_root: unknown, args: { minPlayerCount: number, filterYear: number}, context: ContextWithUser) => {
            const me = await userService.getUser(undefined, context.user.id);
            const friendList = me?.friends.map(friend => friend.toString());

            if (!friendList?.length) return [];

            const games = (await getGamesWithUser(args.minPlayerCount, me?.friends as ID[], args.filterYear))
                .map(game => {
                    game.scorecards = game.scorecards.filter(sc => {
                        return sc.user.toString() === context.user.id || friendList.includes(sc.user.toString());
                    });
                    return game;
                })
                .filter(game => game.scorecards.length >= args.minPlayerCount);

            return games || [];
        },
        getGroupGames: async(_root: unknown, args: {minPlayerCount: number, filterYear: number}, context: ContextWithUser) => {
            const me = await userService.getUser(undefined, context.user.id);
            if (!me?.groupName) return [];
            const userIds = (await userService.getGroupUsers(me.groupName)).map(user => user.id.toString()) as string[];
            const games = (await getGamesWithUser(args.minPlayerCount, userIds, args.filterYear))
                .map(game => {
                    game.scorecards = game.scorecards.filter(sc => userIds.includes(sc.user.toString()));
                    return game;
                })
                .filter(game => game.scorecards.length >= args.minPlayerCount);
            return games;
        },
        getBestPoolForLayout: async (_root: unknown, args: {players: number, layoutId: ID}) => {
            if (!args.players || ! args.layoutId) throw new GraphQLError('Not enough parameters');
            try {
                const result = await getBestPoolGame(args.players, args.layoutId);
                if (!result.length) return null;
                const game = await gameService.getGame(result[0]._id);
                return {
                    game,
                    totalScore: result[0].scores,
                    totalPar: result[0].pars.reduce((acc, par) => acc + par, 0) * args.players,
                    gamesCount: result.length
                };
            } catch {
                return null;
            }
        },
        getPastActivity: async (_root: unknown, args: GetPastActivityArgs, context: ContextWithUser) => {
            const fromDate = args.year ? new Date(args.year, 0, 1, 0, 0) : startOfMonth(addYears(new Date(), -1));
            const toDate = args.year ? new Date(args.year, 11, 31, 23, 59) : endOfMonth(addMonths(new Date(), -1));
            const dates = await gameService.getScorecardsDates(context.user.id, fromDate, toDate);
            const monthNumbers = dates.map(date => +format(date, 'M'));

            const groupedMonths = monthNumbers.reduce((acc, curr) => {
                const prevMonth = acc.find(month => month.month === curr);
                if (!prevMonth) return [...acc, {month: curr, games: 1}];

                return acc.map(month => month.month !== curr ? month : {month: prevMonth.month, games: prevMonth.games + 1} );

            }, [] as {month: number, games: number}[]);

            return {
                from: fromDate.toLocaleDateString(),
                to: toDate.toLocaleDateString(),
                months: groupedMonths
            };

        }
    }
};
