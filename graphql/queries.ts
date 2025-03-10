import { ContextWithUser } from "../types";

import userService from "../services/userService";

import appInfo from "../utils/config";
import { pubsub } from "./subscriptions/subscriptions";
import { getLogs } from "../services/logServerice";
import { SUB_TRIGGERS } from "./subscriptions/types";
import Log from "../services/logServerice";
import { LogContext, LogType } from "../models/Log";

export const queries = {
    Query: {
        handShake: async (_root: unknown, args: {pushToken?: string}, context: ContextWithUser) => {
            const user = await userService.getUser(undefined, context.user?.id);
            if (user && args.pushToken && user.pushToken?.toString() !== args.pushToken) {
                userService.updateSettings(context.user.id, {pushToken: args.pushToken});
                Log('Push token updated', LogType.INFO, LogContext.USER, context.user.id);
            }
            return {
                latestVersion: appInfo.latestVersion
            };
        },
        ping: () => {
            pubsub.publish(SUB_TRIGGERS.TEST, {test: 'Ping pong'});
            return 'pong';
        },
        getLogs: () => {
            return getLogs();
        },
    }
};
