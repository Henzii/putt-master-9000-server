export type Course = {
    name: string,
    id: number | string,
    layouts: Layout[]
}

export type Layout = {
    id?: number | string,
    name: string,
    holes: number,
    pars: number[]
}

export type NewLayoutArgs = Omit<Layout, "id">

export type Game = {
    id: string | number,
    date: Date,
    pars: number[],
    par: number,
    layout: string,
    course: string,
    scorecards: Scorecard[],
    isOpen: boolean,
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
    friends: (ID | User)[],
    blockFriendRequests: boolean,
}
export type SafeUser = Pick<User, 'id' | 'name'>

export type ID = string | number

export type ContextWithUser = {
    user: SafeUser
}