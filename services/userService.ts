import { ID, User } from "../types";
import Users from '../models/User';
import { Document } from "mongoose";

const getUsers = async (): Promise<(Document & User)[]> => {
    const users = await Users.find({}) as (Document & User)[];
    if (users.length === 0) return [];
    return users;
}
const addUser = async (name: string, passwordHash: string, email?: string): Promise<ID> => {
    const newUser = new Users({
        name,
        passwordHash,
        email
    })
    await newUser.save();
    return newUser.id;
}
const makeFriends = async (userOne: makeFriendsArg, userTwo: makeFriendsArg) => {

    try {
        const fOne = await getUser(userOne.name, userOne.id);
        const fTwo = await getUser(userTwo.name, userTwo.id);
        if (!fOne || !fTwo) {
            return false;
        }

        fOne.friends.push(fTwo);
        fTwo.friends.push(fOne);
        await fOne.save();
        await fTwo.save();
        return true;
    } catch (e) {
        return false;
    }
}
const getUser = async (name?: string, id?: ID): Promise<Document & User | null> => {
    let user: Document & User;
    if (id) {
        user = await Users.findById(id) as Document & User;
    } else if (name) {
        user = await Users.findOne({ name }) as Document & User;
    } else {
        return null;
    }
    return user
}

type makeFriendsArg = {
    name?: string,
    id?: ID,
}

export default { getUsers, addUser, getUser, makeFriends }