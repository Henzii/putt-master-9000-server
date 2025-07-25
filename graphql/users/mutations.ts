import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import { LogContext, LogType } from "../../models/Log";
import userService from "../../services/userService";
import { ContextWithUserOrNull } from "../types";
import Log from '../../services/logServerice';
import jwt from "jsonwebtoken";
import bcrypt from 'bcrypt';
import pushNotificationsService from "../../services/pushNotificationsService";
import { ContextWithUser, ID, User } from "../../types";
import { ChangeSettingsArgs, RestoreAccountArgs, UserSettingsArgs } from "./types";

export default {
    Mutation: {
        createUser: async (_root: unknown, args: { name: string, password: string, email?: string, pushToken?: string }, context?: ContextWithUserOrNull) => {
            const hashedPassword = await bcrypt.hash(args.password, 10);
            try {
                const user = await userService.addUser(args.name, hashedPassword, args.email, args.pushToken);
                Log(`User ${user.name} created`, LogType.SUCCESS, LogContext.USER_CREATION, context?.user?.id);
                return jwt.sign({ id: user.id, name: user.name }, process.env.TOKEN_KEY || 'NoKey?NoProblem!#!#!R1fdsf13rn');
            } catch (e) {
                const viesti = (e as mongoose.Error).message;
                Log(`User creation failed, message: ${viesti}`, LogType.ERROR, LogContext.USER_CREATION, context?.user?.id);
                if (viesti.includes('to be unique')) throw new GraphQLError(`Name ${args.name} is already taken!`);
                throw new GraphQLError(`Error when creating accoount! (${(e as mongoose.Error).name})`);
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
            const response = await userService.deleteAccount(context.user.id);
            if (response) {
                Log(`Account ${context.user.name} / ${context.user.id} deleted`, LogType.SUCCESS, LogContext.USER_DELETION);
            } else {
                Log(`Deleting account ${context.user.name} failed`, LogType.ERROR, LogContext.USER_DELETION);
            }
            return response;
        },
        login: async (_root: unknown, args: {user: string, password: string, pushToken?: string}) => {
            if (!process.env.TOKEN_KEY) {
                // eslint-disable-next-line no-console
                console.error('TOKEN_KEY is not set!');
                throw new Error();
            }
            const user = await userService.getUser(args.user);
            if (!user || !(await bcrypt.compare(args.password, user.passwordHash))) {
                throw new GraphQLError('Wrong username or password');
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
        changeSettings: async (_root: unknown, rawargs: ChangeSettingsArgs, context: ContextWithUser) => {
            const { password, userId, ...args } = rawargs;
            const updateUserId = userId ?? context.user.id;

            if ((userId || args.groupJoinedDate) && !userService.isAdmin(context.user.id)) {
                Log(`User ${context.user.name} tried to change settings of user ${updateUserId}`, LogType.WARNING, LogContext.USER);
                throw new GraphQLError('Unauthorized');
            }

            if (rawargs.groupJoinedDate && isNaN(Date.parse(rawargs.groupJoinedDate))) {
                throw new GraphQLError('Invalid date format for groupJoinedDate. Please provide a valid date string.');
            }

            const finalArgs = args as UserSettingsArgs;

            if (password) {
                finalArgs['passwordHash'] = await bcrypt.hash(password, 10);
            }

            return userService.updateSettings(updateUserId, finalArgs);
        },
        restoreAccount: async (_root: unknown, args: RestoreAccountArgs) => {
            const { name, password, restoreCode } = args;
            // Jos argumentteja tulee oudosti
            if (!name || (password && !restoreCode || !password && restoreCode)) {
                throw new GraphQLError('Invalid argument count');
            }
            const user = await userService.getUser(name) as User;

            // Jos käyttäjää ei löydy tai käyttäjä ei ole antanut sähköpostiosoitettaan
            if (!user || !user.email) return true;

            // Jos ei vielä ole palautuskoodia ja uutta salasanaa, lähetetään sähköpostilla
            // palautuskoodi ja tallennetaan se käyttäjälle tietokantaan
            if (!password || !restoreCode) {
                const code = 'ABCD'; // Random ;)
                await userService.updateSettings(user.id, { restoreCode: code });
                return true;
            }
            // Jos palautuskoodi on oikein, vaihdetaan salasana
            else if (restoreCode === user.restoreCode) {
                await userService.updateSettings(user.id, { passwordHash: await bcrypt.hash(password, 10) });
                return true;
            }

            return true;
        },
        changeUsername: async(_root: unknown, args: {newUsername: string}, context: ContextWithUser) => {
            const username = args.newUsername.toLowerCase();
            try {
                const user = await userService.changeUsername(context.user.id, username);
                Log(`User changed their username from ${context.user.name} to ${username}`, LogType.INFO, LogContext.USER, context.user.id);
                return user;
            } catch {
                throw new GraphQLError('Failed to change username. Name is already taken or name validation failed.');
            }
        },
    }
};