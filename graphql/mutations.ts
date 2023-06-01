import { addCourse, addLayout } from "../services/courseService";
import gameService from "../services/gameService";
import userService from "../services/userService";
import achievementService from "../services/achievementService";
import pushNotificationsService from "../services/pushNotificationsService";
import { ContextWithUser, Game, ID, NewLayoutArgs, User } from "../types";
import bcrypt from 'bcrypt';
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { SUB_TRIGGERS, pubsub } from "./subscriptions";
import { requireAuth } from "./permissions";

export const mutations = {
    Mutation: {
        addCourse: (_root: unknown, args: { name: string, coordinates: { lat: number, lon: number } }, context: ContextWithUser) => {
            return addCourse(args.name, args.coordinates, context.user.id);
        },
        addLayout: (_root: unknown, args: { courseId: string | number, layout: NewLayoutArgs }, context: ContextWithUser) => {
            requireAuth(context);
            return addLayout(args.courseId, { ...args.layout, creator: context.user.id }, context.user.id);
        },
        // Game mutations
        createGame: (_root: unknown, args: { layoutId: ID, courseId: ID }) => {
            return gameService.createGame(args.courseId, args.layoutId);
        },
        addPlayersToGame: async (_root: unknown, args: { gameId: string, playerIds: string[] }, context: ContextWithUser): Promise<Game> => {
            const game = await gameService.addPlayersToGame(args.gameId, args.playerIds);

            // Filtteröidään oma id pois listalta, jotta ei turhaan tule notifikaatiota
            const playerIds = args.playerIds.filter(pid => pid !== context.user.id);

            pushNotificationsService.sendNotification(playerIds, {
                title: 'New game',
                body: `${context.user.name} created a new game`,
                sound: 'default',
                data: {
                    gameId: args.gameId
                }
            });
            return game;
        },
        setScore: async (_root: unknown, args: SetScoreArgs, context: ContextWithUser) => {
            requireAuth(context);
            const updatedGame = await gameService.setScore(args);
            pubsub.publish(SUB_TRIGGERS.SCORECARD, {
                [SUB_TRIGGERS.SCORECARD]: {
                    game: updatedGame,
                    updatedScorecardPlayerId: args.playerId,
                    updaterId: context.user.id
                }
            });
            return updatedGame;
        },
        changeGameSettings: async (_root: unknown, args: GameSettingsArgs, context: ContextWithUser) => {
            return await gameService.changeGameSettings(args.gameId, args.settings, context.user.id);
        },
        closeGame: async (_root: unknown, args: { gameId: ID, reopen: boolean }, context: ContextWithUser) => {
            if (args.reopen === true) {
                const game = await gameService.closeGame(args.gameId, true);
                const playerIds = game.scorecards.map(sc => sc.user.id.toString()).filter(id => id !== context.user.id);
                pushNotificationsService.sendNotification(playerIds, {
                    title: 'Game reopened!',
                    body: `${context.user.name} is trying to cheat! He just reopened a game :P (${game.course} / ${game.layout})!`,
                });
                return game;
            }
            else {
                try {
                    const game = await gameService.closeGame(args.gameId);
                    // Mäpätään pelin pelaajien id, filteröidään oma pois.
                    const playerIds = game.scorecards.map(sc => sc.user.id.toString()).filter(id => id !== context.user.id);

                    // Haetaan voittaja
                    const winner = game.scorecards.reduce((p, c) => {
                        const totalScore = c.scores.reduce((total, score) => total + score, 0);
                        if (totalScore < p.score || p.score === 0) {
                            return { name: c.user.name, score: totalScore };
                        }
                        return p;
                    }, { name: 'Nobody', score: 0 });
                    // Radan ihannetulos
                    const coursePar = game.pars.reduce((total, score) => total + score, 0);
                    // Noitifikaatiota sulkemisesta
                    pushNotificationsService.sendNotification(playerIds, {
                        title: 'Game over',
                        body: `${context.user.name} closed the game.\nThe winner was ${winner.name} (${winner.score - coursePar})`,
                    });
                    achievementService.checkAchievements(game);

                    pubsub.publish(SUB_TRIGGERS.SCORECARD, {
                        [SUB_TRIGGERS.SCORECARD]: {
                            game: game,
                        }
                    });
                    return game;
                } catch (e) {
                    // eslint-disable-next-line no-console

                }
            }
        },
        abandonGame: async (_root: unknown, args: { gameId: ID }, context: ContextWithUser) => {
            return await gameService.abandonGame(args.gameId, context.user.id);
        },
        setBeersDrank: async (_root: unknown, args: { gameId: ID, playerId: ID, beers: number }) => {
            return await gameService.setBeersDrank(args.gameId, args.playerId, args.beers);
        },
        // User mutations
        createUser: async (_root: unknown, args: { name: string, password: string, email?: string, pushToken?: string }) => {
            const hashedPassword = await bcrypt.hash(args.password, 10);
            try {
                const user = await userService.addUser(args.name, hashedPassword, args.email, args.pushToken);
                return jwt.sign({ id: user.id, name: user.name }, process.env.TOKEN_KEY || 'NoKey?NoProblem!#!#!R1fdsf13rn');
            } catch (e) {
                const viesti = (e as mongoose.Error).message;
                if (viesti.includes('to be unique')) throw new Error(`Name ${args.name} is already taken!`);
                throw new Error(`Error when creating accoount! (${(e as mongoose.Error).name})`);
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
                throw new Error('Wrong username or password');
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
            requireAuth(context);
            const { password, userId, ...args } = rawargs;
            const updateUserId = userId ?? context.user.id;

            if (userId && !userService.isAdmin(context.user.id)) {
                // eslint-disable-next-line no-console
                console.error(`${context.user.id} failed admin check`);
                throw new Error('Unauthorized');
            }

            const finalArgs = args as UserSettingsArgs;

            if (password) {
                finalArgs['passwordHash'] = await bcrypt.hash(password, 10);
            }
            return await userService.updateSettings(context.user.id, finalArgs);
        },
        restoreAccount: async (_root: unknown, args: RestoreAccountArgs) => {
            const { name, password, restoreCode } = args;
            // Jos argumentteja tulee oudosti
            if (!name || (password && !restoreCode || !password && restoreCode)) {
                throw new Error('Invalid argument count');
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
    }
};

type LoginArgs = {
    user: string,
    password: string,
    pushToken?: string,
}
interface RestoreAccountArgs {
    name?: string,
    restoreCode?: string,
    password?: string,
}
type GameSettingsArgs = {
    gameId: ID,
    settings: {
        isOpen: boolean,
        startTime: string | Date
    }
}
interface SettingsArgs {
    blockFriendRequests?: boolean,
    userId?: ID
}
interface ChangeSettingsArgs extends SettingsArgs {
    password?: string,
}
export interface UserSettingsArgs extends SettingsArgs {
    passwordHash?: string,
    restoreCode?: string,
}
export type SetScoreArgs = {
    gameId: ID,
    playerId: ID,
    hole: number,
    value: number,
}
