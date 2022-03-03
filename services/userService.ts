import { ID, User } from "../types";
import Users from '../models/User';
import Game from '../models/Game';
import { Document } from "mongoose";
import { UserSettingsArgs } from "../graphql/mutations";

const getUsers = async (): Promise<(Document & User)[]> => {
    const users = await Users.find({}) as (Document & User)[];
    if (users.length === 0) return [];
    return users;
};
const addUser = async (name: string, passwordHash: string, email?: string): Promise<User> => {
    const newUser = new Users({
        name,
        passwordHash,
        email
    }) as Document & User;
    await newUser.save();
    return newUser;
};
const removeFriend = async (removeFromUserId: ID, userIdToRemove: ID) => {
    try {
        await Users.updateMany(
            { _id: { $in: [removeFromUserId, userIdToRemove] }},
            { $pull: { friends: { $in: [removeFromUserId, userIdToRemove] } } }
        );
        return true;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
        return false;
    }
};
const deleteAccount = async (userId: ID) => {
    try {
        // Poistetaan kaikki käyttäjän tuloskortit peleistä
        await Game.updateMany(
            {
                'scorecards.user': userId
            },
            {
                $pull: { scorecards: { user: userId } }
            },
        );
        // Poistetaan kaikki kaveruudet
        await Users.updateMany(
            {
                'friends': userId
            },
            {
                $pull: { friends: userId }
            }
        );
        // Poistetaan tunnukset
        await Users.findByIdAndRemove(userId);
        return true;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        return false;
    }
};
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
        console.log(e)
        return false;
    }
};
const getUser = async (name?: string, id?: ID): Promise<Document & User | null> => {
    let user: Document & User;
    try {
        if (id) {
            user = await Users.findById(id) as Document & User;
        } else if (name) {
            user = await Users.findOne({ name }) as Document & User;
        } else {
            return null;
        }
        return user;
    } catch (e) {
        return null;
    }
};
const updateSettings = async (userId: ID, settings: UserSettingsArgs) => {
    const user = await Users.findOneAndUpdate(
        { _id: userId },
        {
            $set: settings
        },
        { returnDocument: 'after' }
    );
    return user;
};
type makeFriendsArg = {
    name?: string,
    id?: ID,
}

export default { getUsers, addUser, getUser, makeFriends, updateSettings, removeFriend, deleteAccount };