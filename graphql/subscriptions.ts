import { PubSub, withFilter } from "graphql-subscriptions";

export const pubsub = new PubSub();

export enum SUB_TRIGGERS {
    TEST = 'test',
    SCORECARD = 'scorecardUpdated'
}

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
        }
    }
};