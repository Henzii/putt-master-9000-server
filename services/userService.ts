import { ID, User } from "../types";
import Users from '../models/User';
import { Document } from "mongoose";
import { UserSettingsArgs } from "../graphql/mutations";

const getUsers = async (): Promise<(Document & User)[]> => {
    const users = await Users.find({}) as (Document & User)[];
    if (users.length === 0) return [];
    return users;
}
const addUser = async (name: string, passwordHash: string, email?: string): Promise<User> => {
    const newUser = new Users({
        name,
        passwordHash,
        email
    }) as Document & User;
    await newUser.save();
    return newUser;
}
const makeFriends = async (userOne: makeFriendsArg, userTwo: makeFriendsArg) => {

    try {
        const fOne = await getUser(userOne.name, userOne.id);
        const fTwo = await getUser(userTwo.name, userTwo.id) as Document & User;
        if (!fOne || !fTwo) {
            return false;
        }
        // Jos userTwo:lla on kaveriesto päällä tai yritetään lisätä itseään
        if (fTwo.blockFriendRequests === true || fOne.id === fTwo.id) {
            return false;
        }
        // Jos kaveri on jo kaverilistalla
        if (fOne.friends.find(f => f.toString() === fTwo.id)) {
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
};
const getUser = async (name?: string, id?: ID): Promise<Document & User | null> => {
    let user: Document & User;
    if (id) {
        user = await Users.findById(id) as Document & User;
    } else if (name) {
        user = await Users.findOne({ name }) as Document & User;
    } else {
        return null;
    }
    return user;
};
const updateSettings = async (userId: ID, settings: UserSettingsArgs) => {
    const user = await Users.findOneAndUpdate(
        { _id: userId },
        {
            $set: settings
        }
    );
    return user;
};
type makeFriendsArg = {
    name?: string,
    id?: ID,
}

export default { getUsers, addUser, getUser, makeFriends, updateSettings}