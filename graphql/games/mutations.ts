import { GraphQLError } from "graphql";
import gameService from "../../services/gameService";
import userService from "../../services/userService";
import { ContextWithUser, Game, ID } from "../../types";
import pushNotificationsService from "../../services/pushNotificationsService";
import { publishGameChanges } from "../publish";
import { GameSettingsArgs, SetScoreArgs } from "./types";
import achievementService from "../../services/achievementService";
import { pubsub } from "../subscriptions/subscriptions";

export default {
    Mutation: {
        createGame: async (_root: unknown, args: { layoutId: ID, courseId: ID, isGroupGame?: boolean, bHcMultiplier?: number }, context: ContextWithUser) => {
            const {layoutId, courseId, isGroupGame, bHcMultiplier} = args;
            const groupName = isGroupGame ? (await userService.getUser(undefined, context.user.id))?.groupName : undefined;

            if (isGroupGame && !groupName) {
                throw new GraphQLError("Cannot create a group game. Creator's group name was not defined.");
            }

            return gameService.createGame(courseId, layoutId, groupName, bHcMultiplier);
        },
        addPlayersToGame: async (_root: unknown, args: { gameId: string, playerIds: string[] }, context: ContextWithUser): Promise<Game> => {
            const game = await gameService.addPlayersToGame(args.gameId, args.playerIds);

            const playerIds = args.playerIds.filter(pid => pid !== context.user.id);

            if (game.groupName) {
                const groupUsers = await userService.getGroupUsers(game.groupName);
                const groupUserIds = groupUsers.map(user => user._id.toString());

                const usersNotParticipating = groupUserIds.filter(userId => !playerIds.includes(userId) && userId !== context.user.id);

                pushNotificationsService.sendNotification(usersNotParticipating, {
                    title: 'New group competition',
                    body: `${context.user.name} has started a new group competition! Looks like you're sitting this one out. 😪`,
                    sound: 'default',
                    data: {
                        gameId: args.gameId
                    }
                });
            }

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
            const updatedGame = await gameService.setScore(args);
            publishGameChanges(updatedGame, context.user.id, pubsub);

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
                    publishGameChanges(game, context.user.id, pubsub);

                    return game;
                } catch (e) {
                    // eslint-disable-next-line no-console

                }
            }
        },
        abandonGame: async (_root: unknown, args: { gameId: ID }, context: ContextWithUser) => {
            return await gameService.abandonGame(args.gameId, context.user.id);
        },
        setBeersDrank: async (_root: unknown, args: { gameId: ID, playerId: ID, beers: number }, context: ContextWithUser) => {
            const {game, scorecard, user} = await gameService.setBeersDrank(args.gameId, args.playerId, args.beers);
            publishGameChanges(game, context.user.id, pubsub);

            return {
                user,
                scorecard
            };
        },
    }
};