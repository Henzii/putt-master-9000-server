import { GraphQLError } from "graphql";
import gameService, { getGame, getGames, getGamesWithUser } from "../../services/gameService";
import { ContextWithUser, ID } from "../../types";
import { GetGamesArgs } from "../types";
import userService from "../../services/userService";

export default {
    Query: {
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
    }
};