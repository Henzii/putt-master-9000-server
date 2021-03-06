export type Course = {
    name: string,
    id: number | string,
    layouts: Layout[]
    location: {
        coordinates: [number, number]
    }
}

export type Layout = {
    id?: number | string,
    name: string,
    holes: number,
    pars: number[],
    creator?: ID,
}

export type NewLayoutArgs = Layout & { creator: ID }

export type Game = {
    id: string | number,
    date: Date,
    pars: number[],
    par: number,
    layout: string,
    course: string,
    scorecards: Scorecard[],
    isOpen: boolean,
    startTime: Date,
    endTime: Date,
}

export type Scorecard = {
    id: string | number,
    user: User,
    scores: number[],
    beers: number,
    plusminus: number,
    hc: number,
    median10: number,
    pars: number[] // plusminuksen laskemiseen
}

export type User = {
    id: string | number,
    name: string,
    passwordHash: string,
    email: string,
    friends: (ID | User)[],
    blockFriendRequests: boolean,
    pushToken?: string,
    restoreCode?: string,
    accountType?: AccountType
}

export type AccountType = 'user' | 'admin' | 'god'

export type SafeUser = Pick<User, 'id' | 'name', 'accountType'>

export type ID = string | number

export type ContextWithUser = {
    user: SafeUser
}

export type RawStatsDataHC = {
    id: ID,
    games: number,
    scores: number[],
    pars: number[],
}