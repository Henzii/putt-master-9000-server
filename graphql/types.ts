export type GetPastActivityArgs = {
    year?: number
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
}