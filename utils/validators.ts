import { User } from "../types";

export const validUser = (val: unknown): val is User => {
    if (!val) return false;

    if (!('id' in (val as User)) || !('name' in (val as User))) return false;
    return false;
}