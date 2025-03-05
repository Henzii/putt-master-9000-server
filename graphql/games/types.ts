import { ID } from "../../types";

export type GameSettingsArgs = {
    gameId: ID,
    settings: {
        isOpen: boolean,
        startTime: string | Date
    }
}

export type SetScoreArgs = {
    gameId: ID,
    playerId: ID,
    hole: number,
    value: number,
}
