import { Game, User } from "../types";

export type Group = {
    name: string
    users: User[]
    owner: User
    inviteCode: string
    closed: boolean
    games: Game[]
}