import { Game, ID, Course } from "../types";
import GameModel from '../models/Game';
import CourseModel from "../models/Course";
import { Document, Mongoose } from "mongoose";
import { SetScoreArgs } from "../graphql/mutations";
import mongoose from 'mongoose';

export const getGame = async (id: ID) => {
    return await GameModel.findById(id).populate({
        path: 'scorecards',
        populate: {
            path: 'user'
        }
    }) as Document & Game;
}
export const getGames = async (userId: ID, populateUsers = false) => {
    const uId = new mongoose.Types.ObjectId(userId);
    if (populateUsers) {
        return await GameModel.find({
           'scorecards.user': userId
        }).populate({
            path: 'scorecards',
            populate: {
                path: 'user'
            }
        }) as (Document & Game)[]
    } else {
        const games = await GameModel.find({ 
            'scorecards.user': userId
        }) as (Document & Game)[];
        console.log(games)
        return games;
    }

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
export default { getGame, getGames, createGame, addPlayersToGame, setScore }

interface UnpopulatedGame extends Omit<Game, 'scorecards'> {
    scorecards:
    {
        user: String,
        scores: number[]
    }[]
}

const games: Game[] = []