import type { PubSub } from "graphql-subscriptions";
import type { Game } from "../types";
import { SUB_TRIGGERS } from "./subscriptions/types";

export const publishGameChanges = (game: Game, updaterId: string | number, pubsub: PubSub) => {
    pubsub.publish(SUB_TRIGGERS.GAME, {
        [SUB_TRIGGERS.GAME]: {
            game,
            updaterId
        }
    });
};
