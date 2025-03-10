import type { ID } from "graphql-ws";
import { getCourses, getLayout } from "../../services/courseService";
import { GetArgs } from "../types";
import { getBestPoolGame, getStatsForLayoyt } from "../../services/statsService";
import type { ContextWithUser } from "../../types";
import { GraphQLError } from "graphql";
import gameService from "../../services/gameService";

export default {
    Query: {
        getLayout: (_root: unknown, args: {layoutId: ID}) => {
            return getLayout(args.layoutId);
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
        getLayoutStats: async (_root: unknown, args: { layoutId: ID, playersIds: ID[]}, context: ContextWithUser) => {
            const res = await getStatsForLayoyt(args.layoutId, args.playersIds || [context.user.id]);
            return res;
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
    }
};
