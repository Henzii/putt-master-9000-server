import { getCourses, getLayout } from "../services/courseService";
import { getGames, getGame, getMyAndFriendsGames } from "../services/gameService";
import { ContextWithUser, ID } from "../types";

import userService from "../services/userService";
import { getPlayersScores, getStatsForLayoyt } from "../services/statsService";

import appInfo from "../utils/appInfo";
import { requireAuth } from "./permissions";
import { SUB_TRIGGERS, pubsub } from "./subscriptions";

interface GetArgs {
    limit: number,
    offset: number,
    search?: string,
    maxDistance?: number,
}
interface GetGamesArgs extends GetArgs {
    onlyOpenGames?: boolean,
    minPlayerCount?: number
}
export const queries = {
    Query: {
        handShake: async () => {
            return {
                ...appInfo
            };
        },
        getCourses: async (_root: unknown, args: GetArgs, context: ContextWithUser) => {
            requireAuth(context);
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
        getLayout: (_root: unknown, args: {layoutId: ID}, context: ContextWithUser) => {
            requireAuth(context);
            return getLayout(args.layoutId);
        },
        getMe: async (_root: unknown, args: unknown, context: ContextWithUser) => {
            if (!context?.user?.id) return null;
            return await userService.getUser(undefined, context.user?.id);
        },
        getGames: async (root: unknown, args: GetGamesArgs, context: ContextWithUser) => {
            return await getGames({ userId: context.user.id, ...args});
        },
        getGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new Error('Not enough parameters');
            return await getGame(args.gameId);
        },
        getLiveGame: async (_root: unknown, args: { gameId: ID }) => {
            if (!args.gameId) throw new Error('Params error');
            const game = await getGame(args.gameId);
            if (game.isOpen) return game;
            // Kauanko peli on ollut suljettuna (tuntia)
            const diff = ((new Date(Date.now()).getTime() - new Date(game.endTime).getTime()) / 1000 / 60 / 60);
            if (diff > 24) throw new Error('Game is no longer available on live feed');
            return game;
        },
        ping: () => {
            pubsub.publish(SUB_TRIGGERS.TEST, {test: 'Ping pong'});
            return 'pong';
        },
        getUsers: async (_root: unknown, _args: unknown, context: ContextWithUser) => {
            requireAuth(context);
            if (!userService.isAdmin(context.user.id)) {
                throw new Error('Unauthorized');
            } else {
                return await userService.getUsers();
            }
            return null;
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

            const games = (await getMyAndFriendsGames(args.minPlayerCount, me?.friends as ID[], args.filterYear))
                .map(game => {
                    game.scorecards = game.scorecards.filter(sc => {
                        return sc.user.toString() === context.user.id || friendList.includes(sc.user.toString());
                    });
                    return game;
                })
                .filter(game => game.scorecards.length >= args.minPlayerCount);

            return games || [];
        }
    }
};
