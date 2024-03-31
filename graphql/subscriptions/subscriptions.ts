import { PubSub, withFilter } from "graphql-subscriptions";
import { SUB_TRIGGERS } from "./types";

export const pubsub = new PubSub();

export const subscriptions = {
    Subscription: {
        test: {
            subscribe: () => pubsub.asyncIterator(SUB_TRIGGERS.TEST)
        },
        [SUB_TRIGGERS.SCORECARD]: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(SUB_TRIGGERS.SCORECARD),
                (payload, variables) => {
                    return payload[SUB_TRIGGERS.SCORECARD].game.id === variables.gameId;
                }
            )
        },
        [SUB_TRIGGERS.GAME]: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(SUB_TRIGGERS.GAME),
                (payload, variables) => {
                    return payload[SUB_TRIGGERS.GAME].game.id === variables.gameId;
                }
            )
        }
    }
};