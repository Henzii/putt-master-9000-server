import { ID, SafeUser, User } from "../types";
import Users from '../models/User';
import Game from '../models/Game';
import mongoose, { Document } from "mongoose";
import { UserSettingsArgs } from "../graphql/mutations";

const getUsers = async (): Promise<(Document & User)[]> => {
    const users = await Users.find({}) as (Document & User)[];
    if (users.length === 0) return [];
    return users;
};

const isAdmin = async (userId: ID) => {
    const user = await Users.findById({_id: userId});
    return user?.accountType === 'admin'|| user?.accountType === 'god';
};

const searchUser = async (searchString: string): Promise<{ users: SafeUser[], hasMore: boolean}> => {
    const users = await Users.find<User & Document>({
        name: { $regex: searchString, $options: 'i' },
        blockFriendRequests: false,
    }).limit(10);
    return { users: users.map(u => {
        return {
            id: u.id,
            name: u.name
        };
    }), hasMore: users.length >= 10};
};
const getUsersPushTokens = async (userIds: ID[]): Promise<string[]> => {
    const users = await Users.find(
        {
            _id: { $in: userIds },
            pushToken: { $exists: true }
        },
    ) as (Document & User)[];
    if (!users) return [];
    return users.map(u => u.pushToken || '');
};
const removePushToken = async (token: string) => {
    try {
        await Users.findOneAndUpdate(
            {
                pushToken: token,
            },
            {
                $unset: { pushToken: "" }
            }
        );
        return true;
    }
    catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
    }
    return false;
};
const addUser = async (name: string, passwordHash: string, email?: string, pushToken?: string): Promise<User> => {
    const newUser = new Users<Partial<User>>({
        name: name.toLowerCase(),
        passwordHash,
        email,
        pushToken,
    });
    await newUser.save();
    return newUser as unknown as User;
};
const removeFriend = async (removeFromUserId: ID, userIdToRemove: ID) => {
    try {
        await Users.updateMany(
            { _id: { $in: [removeFromUserId, userIdToRemove] } },
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
/**
 *
 * @param userOne Lisääjän id tai nimi
 * @param userTwo Lisätyn id tai nimi
 * @returns [userOne.id, userTwo.id]
 */
const makeFriends = async (userOne: makeFriendsArg, userTwo: makeFriendsArg): Promise<ID[] | null> => {
    try {
        const fOne = await getUser(userOne.name, userOne.id);
        const fTwo = await getUser(userTwo.name, userTwo.id) as Document & User;
        if (!fOne || !fTwo) {
            return null;
        }
        // Jos userTwo:lla on kaveriesto päällä tai yritetään lisätä itseään
        if (fTwo.blockFriendRequests === true || fOne.id === fTwo.id) {
            return null;
        }
        // Jos kaveri on jo kaverilistalla
        if (fOne.friends.find(f => f.toString() === fTwo.id)) {
            return null;
        }

        fOne.friends.push(fTwo);
        fTwo.friends.push(fOne);
        await fOne.save();
        await fTwo.save();
        return [fOne.id, fTwo.id];
    } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
    }
    return null;
};
export const getUser = async (name?: string, id?: ID): Promise<Document & User | null> => {
    let user: Document & User;
    try {
        if (id) {
            user = await Users.findById(id) as Document & User;
        } else if (name) {
            user = await Users.findOne({ name: name.toLowerCase() }) as Document & User;
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
const getGroupUsers = async (groupName: string) => {
    const users = await Users.find<Document & User>({
        groupName
    });
    return users;
};

type makeFriendsArg = {
    name?: string,
    id?: ID,
}

export default {
    getUsers, addUser, getUser, makeFriends, updateSettings,
    removeFriend, deleteAccount, getUsersPushTokens,
    removePushToken, searchUser, isAdmin, getGroupUsers,
};