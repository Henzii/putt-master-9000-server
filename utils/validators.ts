import mongoose from "mongoose";
import { ID, User } from "../types";

export const validUser = (val: unknown): val is User => {
    if (!val) return false;

    if (!('id' in (val as User)) || !('name' in (val as User))) return false;
    return false;
};

export const strToObjectId = (id: string | mongoose.Types.ObjectId | ID): mongoose.Types.ObjectId => {
   return new mongoose.Types.ObjectId(id);
};
