import { ObjectId } from "mongoose";
import groupService from "../../services/groupService";
import { ContextWithUser, ID } from "../../types";
import { MutableGroupSettings } from "../../types/Group";
import { UserContext } from "../../types/Context";

const mutations = {
    Mutation: {
        createGroup: async (_root: unknown, args: {name: string}, context: ContextWithUser) => {
            return groupService.createGroup(args.name, context.user.id);
        },
        changeGroupSettings: async (_root: unknown, args:{newSettings:  MutableGroupSettings, groupId: ID}, context: ContextWithUser) => {
            return groupService.changeGroupSettings(args.groupId, args.newSettings, context.user.id);
        },
        connectGroupToGame: async (_root: unknown, args: {groupId: ObjectId, gameId: ObjectId}, context: UserContext) => {
            try {
                await groupService.connectGame(args.groupId, args.gameId);
                return true;
            } catch {
                return false;
            }
        }
    }
};

export default mutations;