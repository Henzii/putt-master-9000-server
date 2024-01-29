import { ObjectId } from "mongoose";
import { Game, ID } from "../types";

export type Group = {
    id: ID
    name: string
    users: ObjectId[]
    owner: ObjectId
    inviteCode: string
    closed: boolean
    games: Game[]
    minNumberOfPlayers: number
}

export type MutableGroupSettings = Partial<Pick<Group,
    'closed' |
    'minNumberOfPlayers' |
    'name'
>>