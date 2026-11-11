import { ContextWithUser } from "../types";

import userService from "../services/userService";

import appInfo from "../utils/config";
import { pubsub } from "./subscriptions/subscriptions";
import { SUB_TRIGGERS } from "./subscriptions/types";
import { log as logEvent } from "../services/logServiceV2";

export const queries = {
    Query: {
        handShake: async (_root: unknown, args: {pushToken?: string}, context: ContextWithUser) => {
            const user = await userService.getUser(undefined, context.user?.id);
            if (user && args.pushToken && user.pushToken?.toString() !== args.pushToken) {
                await userService.updateSettings(context.user.id, {pushToken: args.pushToken});
                logEvent("user.update", `Push token updated for user ${context.user.id}`);
            }
            return {
                latestVersion: appInfo.latestVersion
            };
        },
        ping: () => {
            pubsub.publish(SUB_TRIGGERS.TEST, {test: 'Ping pong'});
            return 'pong';
        },
    }
};
