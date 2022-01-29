import { addCourse, addLayout } from "../services/courseService";
import gameService from "../services/gameService";
import userService from "../services/userService";
import { ContextWithUser, ID, NewLayoutArgs } from "../types";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import { UserInputError } from "apollo-server";
import jwt from "jsonwebtoken";

type LoginArgs = {
    user: string,
    password: string
}
export type SetScoreArgs = {
    gameId: ID,
    playerId: ID,
    hole: number,
    value: number,
}
export const mutations = {
    Mutation: {
        addCourse: (_root: unknown, args: { name: string }) => {
            return addCourse(args.name)
        },
        addLayout: (_root: unknown, args: { courseId: string | number, layout: NewLayoutArgs }) => {
            return addLayout(args.courseId, args.layout)
        },
        
        // Game mutations
        createGame: (_root: unknown, args: { layoutId: ID, courseId: ID }) => {
            return gameService.createGame(args.courseId, args.layoutId);
        },
        addPlayersToGame: async (_root: unknown, args: { gameId: string, playerIds: string[] }) => {
            return await gameService.addPlayersToGame(args.gameId, args.playerIds)
        },
        setScore: async (_root: unknown, args: SetScoreArgs) => {
            return await gameService.setScore(args);
        },
        // User mutations
        createUser: async (_root: unknown, args: { name: string, password: string, email?: string }) => {
            const hashedPassword = await bcrypt.hash(args.password, 10);
            try {
                const newId = await userService.addUser(args.name, hashedPassword, args.email)
                return newId;
            } catch (e) {
                const viesti = (e as mongoose.Error).message;
                if (viesti.includes('to be unique')) throw new UserInputError(`Name ${args.name} is already taken!`)
                throw new UserInputError(`Error when creating accoount! (${(e as mongoose.Error).name})`)
            }
        },
        addFriend: async (_root: unknown, args: { friendId?: ID, friendName?: string }, context: ContextWithUser) => {
            return await userService.makeFriends({ id: context.user.id }, { id: args.friendId, name: args.friendName })
        },
        login: async (_root: unknown, args: LoginArgs) => {
            const user = await userService.getUser(args.user)
            if (!user || !(await bcrypt.compare(args.password, user.passwordHash))) {
                throw new UserInputError('Wrong username or password')
            } else {
                const payload = {
                    id: user.id,
                    name: user.name,
                }
                return jwt.sign(payload, process.env.TOKEN_KEY || 'NoKey?NoProblem!#!#!R1fdsf13rn')
            }
            
        }
    }
}


