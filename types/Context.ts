import { ObjectId } from "mongoose";

export type UserContext = {
    user: {
        id: ObjectId,
        name: string
    }
}

export type UnsureUserContext = UserContext | {
    user: null
}