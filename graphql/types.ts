import { ID, SafeUser } from "../types";

export type ContextWithUserOrNull = {
    user: SafeUser | null
}

export type GetPastActivityArgs = {
    year?: number
    userId?: ID
}

export type GetArgs = {
    limit: number,
    offset: number,
    search?: string,
    maxDistance?: number,
}
export type GetGamesArgs = GetArgs & {
    onlyOpenGames?: boolean,
    minPlayerCount?: number
    from?: string
    to?: string
}