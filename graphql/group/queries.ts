import Group from "../../models/Group";
import { ContextWithUser } from "../../types";

export default {
    Query: {
        // MUTATION!
        createGroup: (_context: unknown, args: {name: string}, context: ContextWithUser) => {
            return Group.createGroup(args.name, context.user.id);
        },

        getMyGroups: (_context: unknown, args: {created: boolean}, context: ContextWithUser) => {
            return Group.find({
                users: context.user.id
            }).populate(['users', 'games']);
        }
    }
};