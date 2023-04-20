import { PubSub, withFilter } from "graphql-subscriptions";

export const pubsub = new PubSub();

export enum SUB_TRIGGERS {
    TEST = 'test',
    GAME = 'gameUpdated'
}

export const subscriptions = {
    Subscription: {
        test: {
            subscribe: () => pubsub.asyncIterator(SUB_TRIGGERS.TEST)
        },
        [SUB_TRIGGERS.GAME]: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(SUB_TRIGGERS.GAME),
                (payload, variables) => {
                    return payload[SUB_TRIGGERS.GAME]?.id === variables?.gameId;
                }
            )
        }
    }
};