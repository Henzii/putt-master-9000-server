import { ObjectId } from "mongoose";
import Group from "../models/Group";
import { ID } from "../types";
import { MutableGroupSettings } from "../types/Group";
import { isAdmin } from "./userService";

export const changeGroupSettings = async (groupId: ID, newSettings: MutableGroupSettings, userId: ID) => {
    const group = await Group.findById(groupId);
    if (!group || (userId !== group?.owner.toString() && !(await isAdmin(userId)))) {
        return null;
    }

    return Group.findByIdAndUpdate(groupId, newSettings, {new: true});
};

export const getGroup = async (groupId: ID) => Group.findById(groupId);

export const getUserGroups = async (userId: ID, created: boolean) => (
    Group.find({
        users: userId,
        ...(created ? {owner: userId} : undefined)
    })
);

export const createGroup = async(groupName: string, creatorId: ID) =>
    Group.createGroup(groupName, creatorId);

export const connectGame = async(groupId: ObjectId, gameId: ObjectId) => {
    return Group.findByIdAndUpdate(groupId, {
        $addToSet: { games: gameId }
    });
};

export default {changeGroupSettings, getGroup, getUserGroups, createGroup, connectGame};