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

export enum PoolType {
    WINNER = "WINNER",
}

export type Pool = {
    type: string,
    bets: {
        totalStake: number,
        user: {
            id: ID
        },
        selections: number[],
        lines: {
            stake: number,
            line: {
                leg: number,
                selection: number
            }[]
        }[]
    }[],
    result: {
        winningSelection: number[]
    }
}