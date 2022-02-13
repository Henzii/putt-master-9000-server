import { Game, ID, Course, Scorecard } from "../types";
import GameModel from '../models/Game';
import CourseModel from "../models/Course";
import { Document } from "mongoose";
import { SetScoreArgs } from "../graphql/mutations";

export const getGame = async (id: ID) => {
    return await GameModel.findById(id) as Document & Game;
}
export const getGames = async (userId: ID) => {
    const games = await GameModel.find({
        'scorecards.user': userId
    }).sort({ date: -1 }) as (Document & Game)[];
    return games;
}
export const addPlayersToGame = async (gameId: ID, playerIds: ID[]) => {
    console.log(gameId, playerIds)
    const game = await GameModel.findOneAndUpdate(
        { _id: gameId },
        {
            $addToSet: {
                scorecards: playerIds.map(p => {
                    return { user: p, scores: [] }
                })
            }
        }
    )
    console.log(game);
    return game;
}
export const createGame = async (courseId: ID, layoutId: ID) => {
    try {
        const course = await CourseModel.findById(courseId) as Document & Course;
        if (!course) {
            throw new Error('Course not found!!')
        }
        const layout = course.layouts.find(l => l.id === layoutId)
        if (!layout) {
            throw new Error('Layout not found!!')
        }
        const newGame = new GameModel({
            date: new Date(),
            layout: layout?.name,
            course: course.name,
            pars: layout?.pars,
            holes: layout?.holes,
            isOpen: true,
            scorecards: [],
        }) as Document & Game;
        await newGame.save();
        return newGame.id;

    } catch (e) {
        console.log(e)
    }
}
export const setScore = async (args: SetScoreArgs) => {
    const game = await GameModel.findById(args.gameId) as Document & UnpopulatedGame;
    game.scorecards = game.scorecards.map(s => {
        if (s.user.toString() === args.playerId) {
            s.scores[args.hole] = args.value;
            return s
        }
        return s;
    })
    await game.save();
    return game;
}
export const closeGame = async (gameId: ID) => {
    const game = await GameModel.findByIdAndUpdate(gameId, {
        isOpen: false
    }, { returnDocument: 'after' });
    return game;
}
export const setBeersDrank = async (gameId: ID, playerId: ID, beers: number) => {
    const game = await GameModel.findById(gameId) as Document & Game;
    game.scorecards = game.scorecards.map(sc => {
        if (sc.user.toString() === playerId) {
            sc['beers'] = beers;
        }
        return sc;
    })
    return await game.save();
}
export default { getGame, getGames, createGame, addPlayersToGame, setScore, closeGame, setBeersDrank }

interface UnpopulatedGame extends Omit<Game, 'scorecards'> {
    scorecards:
    {
        user: String,
        scores: number[]
    }[]
}

const games: Game[] = []