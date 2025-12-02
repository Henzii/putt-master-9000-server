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

export type Selection = {
    id: number,
    type?: 'Player',
    value: string
}

export enum LegType {
    WINNER = "WINNER",
    WINNER_HC = "WINNER_HC",
    HOLE_IN_ONE = "HOLE_IN_ONE",
}

export enum PoolStatus {
    OPEN = "OPEN",
    SETTLED = "SETTLED"
}

export type Leg = {
    type: LegType,
    selections: Selection[]
}

export type Pool = {
    status: PoolStatus,
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
    legs: Leg[],
    result: {
        winningSelection: number[][]
    }
}