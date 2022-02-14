export type Course = {
    name: String,
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
    layout: Layout | ID,
    scorecards: Scorecard[],
    isOpen: boolean,
}

export type Scorecard = {
    id: string | number,
    user: User,
    scores: number[],
    beers: number,
    plusminus: number,
    pars: number[] // plusminuksen laskemiseen
}

export type User = {
    id: string | number,
    name: string,
    passwordHash: string,
    friends: (ID | User)[]
}
export type SafeUser = Pick<User, 'id' | 'name'>

export type ID = string | number

export type ContextWithUser = {
    user: SafeUser
}