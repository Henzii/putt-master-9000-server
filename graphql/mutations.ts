import { addCourse, addLayout } from "../services/courseService";
import gameService from "../services/gameService";
import userService from "../services/userService";
import pushNotificationsService from "../services/pushNotificationsService";
import { ContextWithUser, ID, NewLayoutArgs } from "../types";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import { UserInputError } from "apollo-server";
import jwt from "jsonwebtoken";

export const mutations = {
    Mutation: {
        addCourse: (_root: unknown, args: { name: string }) => {
            return addCourse(args.name);
        },
        addLayout: (_root: unknown, args: { courseId: string | number, layout: NewLayoutArgs }) => {
            return addLayout(args.courseId, args.layout);
        },
        // Game mutations
        createGame: (_root: unknown, args: { layoutId: ID, courseId: ID }) => {
            return gameService.createGame(args.courseId, args.layoutId);
        },
        addPlayersToGame: async (_root: unknown, args: { gameId: string, playerIds: string[] }) => {
            return await gameService.addPlayersToGame(args.gameId, args.playerIds);
        },
        setScore: async (_root: unknown, args: SetScoreArgs) => {
            return await gameService.setScore(args);
        },
        closeGame: async(_root: unknown, args: { gameId: ID }) => {
            return await gameService.closeGame(args.gameId);
        },
        abandonGame: async(_root: unknown, args: { gameId: ID}, context: ContextWithUser) => {
            return await gameService.abandonGame(args.gameId, context.user.id);
        },
        setBeersDrank: async(_root: unknown, args: { gameId: ID, playerId: ID, beers: number}) => {
            return await gameService.setBeersDrank(args.gameId, args.playerId, args.beers);
        },
        // User mutations
        createUser: async (_root: unknown, args: { name: string, password: string, email?: string }) => {
            const hashedPassword = await bcrypt.hash(args.password, 10);
            try {
                const user = await userService.addUser(args.name, hashedPassword, args.email);
                return jwt.sign({ id: user.id, name: user.name }, process.env.TOKEN_KEY || 'NoKey?NoProblem!#!#!R1fdsf13rn');
            } catch (e) {
                const viesti = (e as mongoose.Error).message;
                if (viesti.includes('to be unique')) throw new UserInputError(`Name ${args.name} is already taken!`);
                throw new UserInputError(`Error when creating accoount! (${(e as mongoose.Error).name})`);
            }
        },
        addFriend: async (_root: unknown, args: { friendId?: ID, friendName?: string }, context: ContextWithUser) => {
            const res = await userService.makeFriends({ id: context.user.id }, { id: args.friendId, name: args.friendName });
            // Jos kaverin lisäys onnistui, lähetetään lisätylle push-notifikaatio
            if (res && res[1]) {
                pushNotificationsService.sendNotification([res[1]], {
                    body: `${context.user.name} added you as a friend`,
                    sound: 'default',
                });
                return true;
            }
            return false;
        },
        removeFriend: async (_root: unknown, args: { friendId: ID }, context: ContextWithUser) => {
            return await userService.removeFriend(context.user.id, args.friendId);
        },
        deleteAccount: async (_root: unknown, _args: unknown, context: ContextWithUser) => {
            return await userService.deleteAccount(context.user.id);
        },
        login: async (_root: unknown, args: LoginArgs) => {
            if (!process.env.TOKEN_KEY) {
                // eslint-disable-next-line no-console
                console.error('TOKEN_KEY is not set!');
                throw new Error();
            }
            const user = await userService.getUser(args.user);
            if (!user || !(await bcrypt.compare(args.password, user.passwordHash))) {
                throw new UserInputError('Wrong username or password');
            } else {
                const payload = {
                    id: user.id,
                    name: user.name,
                };
                if (args.pushToken && (args.pushToken !== user.pushToken)) {
                    user.pushToken = args.pushToken;
                    await user.save();
                }
                return jwt.sign(payload, process.env.TOKEN_KEY);
            }
        },
        changeSettings: async (_root: unknown, args: UserSettingsArgs, context: ContextWithUser) => {
            return await userService.updateSettings(context.user.id, args);
        },
    }
};

type LoginArgs = {
    user: string,
    password: string,
    pushToken?: string,
}
export type UserSettingsArgs = {
    blockFriendRequests: boolean,
}
export type SetScoreArgs = {
    gameId: ID,
    playerId: ID,
    hole: number,
    value: number,
}
