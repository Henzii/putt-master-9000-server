import type { ID } from "graphql-ws";
import { getCourses, getLayout } from "../../services/courseService";
import { GetArgs } from "../types";
import { getStatsForLayoyt } from "../../services/statsService";
import type { ContextWithUser } from "../../types";

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
    }
};
