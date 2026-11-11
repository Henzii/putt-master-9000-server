import { GraphQLError } from "graphql";
import mongoose from "mongoose";
import userService from "../../services/userService";
import { log as logEvent } from "../../services/logServiceV2";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { sendEmail } from "../../services/mailService";
import pushNotificationsService from "../../services/pushNotificationsService";
import { ContextWithUser, ID } from "../../types";
import {
  ChangeSettingsArgs,
  MeasuredThrowArgs,
  RestoreAccountArgs,
  UserSettingsArgs,
} from "./types";

export default {
  Mutation: {
    createUser: async (
      _root: unknown,
      args: {
        name: string;
        password: string;
        email?: string;
        pushToken?: string;
      },
    ) => {
      const hashedPassword = await bcrypt.hash(args.password, 10);
      try {
        const user = await userService.addUser(
          args.name,
          hashedPassword,
          args.email,
          args.pushToken
        );
        logEvent(
          "user.create",
          `User ${user.name} created`,
        );
        return jwt.sign(
          { id: user.id, name: user.name },
          process.env.TOKEN_KEY || "NoKey?NoProblem!#!#!R1fdsf13rn"
        );
      } catch (e) {
        const viesti = (e as mongoose.Error).message;
        logEvent(
          "user.create",
          `User creation failed, message: ${viesti}`,
          "ERROR"
        );
        if (viesti.includes("to be unique"))
          throw new GraphQLError(`Name ${args.name} is already taken!`);
        throw new GraphQLError(
          `Error when creating accoount! (${(e as mongoose.Error).name})`
        );
      }
    },
    addFriend: async (
      _root: unknown,
      args: { friendId?: ID; friendName?: string },
      context: ContextWithUser
    ) => {
      const res = await userService.makeFriends(
        { id: context.user.id },
        { id: args.friendId, name: args.friendName }
      );
      // Jos kaverin lisäys onnistui, lähetetään lisätylle push-notifikaatio
      if (res && res[1]) {
        pushNotificationsService.sendNotification([res[1]], {
          body: `${context.user.name} added you as a friend`,
          sound: "default",
        });
        return true;
      }
      return false;
    },
    removeFriend: async (
      _root: unknown,
      args: { friendId: ID },
      context: ContextWithUser
    ) => {
      return await userService.removeFriend(context.user.id, args.friendId);
    },
    deleteAccount: async (
      _root: unknown,
      _args: unknown,
      context: ContextWithUser
    ) => {
      const response = await userService.deleteAccount(context.user.id);
      if (response) {
        logEvent(
          "user.delete",
          `Account ${context.user.name} / ${context.user.id} deleted`,
        );
      } else {
        logEvent(
          "user.delete",
          `Deleting account ${context.user.name} failed`,
          "ERROR"
        );
      }
      return Boolean(response);
    },
    deleteAccounts: async (
      _root: unknown,
      args: { userIds: ID[] },
    ) => {
      const response = await userService.deleteAccount(args.userIds);
      if (response) {
        logEvent(
          "user.delete",
          `${response} accounts deleted`,
        );
      } else {
        logEvent(
          "user.delete",
          `Deleting multiple account failed!`,
          "ERROR"
        );
      }
      return Boolean(response);
    },
    login: async (
      _root: unknown,
      args: { user: string; password: string; pushToken?: string }
    ) => {
      if (!process.env.TOKEN_KEY) {
        // eslint-disable-next-line no-console
        console.error("TOKEN_KEY is not set!");
        logEvent(
          "user.login",
          "Login failed, TOKEN_KEY is not set!",
          "FATAL"
        );
        throw new Error();
      }
      const user = await userService.getUser(args.user);
      if (!user) throw new GraphQLError("Wrong username or password");

      const isValidRecovery =
        !!user.recoveryHash &&
        !!user.recoveryExpires &&
        user.recoveryExpires > new Date() &&
        (await bcrypt.compare(args.password, user.recoveryHash));

      const isValidPassword =
        !isValidRecovery &&
        (await bcrypt.compare(args.password, user.passwordHash));

      if (!isValidRecovery && !isValidPassword) {
        throw new GraphQLError("Wrong username or password");
      }

      if (isValidRecovery) {
        await userService.clearRecovery(user.id);
      }

      const payload = { id: user.id, name: user.name };
      if (args.pushToken && args.pushToken !== user.pushToken) {
        user.pushToken = args.pushToken;
        await user.save();
      }
      return jwt.sign(payload, process.env.TOKEN_KEY);
    },
    changeSettings: async (
      _root: unknown,
      rawargs: ChangeSettingsArgs,
      context: ContextWithUser
    ) => {
      const { password, userId, groupJoinedDate, ...args } = rawargs;
      const updateUserId = userId ?? context.user.id;

      if (
        Boolean(userId || groupJoinedDate) &&
        !(await userService.isAdmin(context.user.id))
      ) {
        logEvent(
          "user.update",
          `User ${context.user.name} tried to change settings of user ${updateUserId}`,
          "WARN"
        );
        throw new GraphQLError("Unauthorized");
      }

      const finalArgs: UserSettingsArgs = args;

      if (groupJoinedDate) {
        const date = new Date(groupJoinedDate);
        if (isNaN(date.getTime())) {
          throw new GraphQLError("Invalid date format for groupJoinedDate");
        }
        finalArgs.groupJoinedDate = date;
      } else if (rawargs.groupName) {
        finalArgs.groupJoinedDate = new Date();
      }

      if (password) {
        finalArgs["passwordHash"] = await bcrypt.hash(password, 10);
      }

      try {
        const updatedUser = await userService.updateSettings(
          updateUserId,
          finalArgs
        );
        return updatedUser;
      } catch {
        throw new GraphQLError("Failed to change settings.");
      }
    },
    restoreAccount: async (_root: unknown, args: RestoreAccountArgs) => {
      const { email } = args;
      if (!email) throw new GraphQLError("Invalid argument count");

      const user = await userService.getUserByEmail(email);
      if (!user) return true; // Don't reveal whether account exists

      const tempPassword = randomBytes(9).toString("base64");
      const recoveryExpires = new Date(Date.now() + 5 * 60 * 1000);

      await userService.updateSettings(user.id, {
        recoveryHash: await bcrypt.hash(tempPassword, 10),
        recoveryExpires,
      });

      if (user.email) {
        sendEmail({
          from: process.env.MAIL_USER || "",
          to: user.email,
          subject: "FuDisc - Account recovery",
          text: `Your temporary login password is: ${tempPassword}\n\nYou can only use it once and it expires in 5 minutes. Log in and change your password in settings.`,
        });
      }

      return true;
    },
    changeUsername: async (
      _root: unknown,
      args: { newUsername: string },
      context: ContextWithUser
    ) => {
      const username = args.newUsername.toLowerCase();
      try {
        const user = await userService.changeUsername(
          context.user.id,
          username
        );
        logEvent(
          "user.update",
          `User changed their username from ${context.user.name} to ${username}`,
        );
        return user;
      } catch {
        logEvent(
          "user.update",
          `User ${context.user.name} failed to change their username to ${username}`,
          "ERROR"
        );
        throw new GraphQLError(
          "Failed to change username. Name is already taken or name validation failed."
        );
      }
    },
    addMeasuredThrow: async (
      _root: unknown,
      args: MeasuredThrowArgs,
      context: ContextWithUser
    ) => {
      try {
        const user = await userService.addMeasuredThrow(
          context.user.id,
          args.throw
        );
        return user?.measuredThrows;
      } catch {
        throw new GraphQLError("Failed to add measured throw.");
      }
    },
    deleteMeasuredThrow: async (
      _root: unknown,
      args: { throwId: ID },
      context: ContextWithUser
    ) => {
      try {
        const user = await userService.deleteMeasuredThrow(
          context.user.id,
          args.throwId
        );
        return user?.measuredThrows;
      } catch {
        throw new GraphQLError("Failed to delete measured throw.");
      }
    },
  },
};
