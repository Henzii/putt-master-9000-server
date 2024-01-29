import { GraphQLError } from "graphql";
import groupService from "../../services/groupService";
import { ContextWithUser, ID } from "../../types";
import { UserContext } from "../../types/Context";

export const queries = {
    Query: {
        getMyGroups: (_context: unknown, args: {created?: boolean}, context: ContextWithUser) => {
            return groupService.getUserGroups(context.user.id, args.created ?? false);
        },
        getGroup: async (_context: unknown, args: {groupId: ID}, context: UserContext) => {
            const group = await groupService.getGroup(args.groupId);
            if (!group?.users.includes(context.user.id)) {
                throw new GraphQLError('Not your group');
            }
            return group;
        }
    }
};

export default queries;